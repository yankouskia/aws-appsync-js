import { describe, expect, test, vi } from 'vitest';
import {
  AppSyncAbortError,
  AppSyncClient,
  type AppSyncGraphQLError,
  AppSyncHttpError,
  AppSyncNetworkError,
} from '../src/index.ts';
import { fakeFetch } from './_fake-fetch.ts';

const URL_ = 'https://example.appsync-api.us-east-1.amazonaws.com/graphql';
const API_KEY = 'da2-test';

describe('AppSyncClient — construction', () => {
  test('throws when url is missing', () => {
    expect(
      () =>
        new AppSyncClient({
          // @ts-expect-error intentionally missing
          url: undefined,
          auth: { type: 'apiKey', apiKey: API_KEY },
        }),
    ).toThrow(/url/);
  });

  test('throws when auth is missing', () => {
    expect(
      () =>
        new AppSyncClient({
          url: URL_,
          // @ts-expect-error intentionally missing
          auth: undefined,
        }),
    ).toThrow(/auth/);
  });

  test('throws when there is no fetch implementation available', () => {
    const realFetch = globalThis.fetch;
    // @ts-expect-error simulating an environment without fetch
    globalThis.fetch = undefined;
    try {
      expect(
        () =>
          new AppSyncClient({
            url: URL_,
            auth: { type: 'apiKey', apiKey: API_KEY },
          }),
      ).toThrow(/fetch/);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});

describe('AppSyncClient — request', () => {
  test('returns data on a happy-path API_KEY query', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: { events: [{ id: '1' }] } } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });

    const data = await client.request<{ events: Array<{ id: string }> }>('query { events { id } }');

    expect(data.events).toEqual([{ id: '1' }]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe('POST');
    expect(calls[0]?.url).toBe(URL_);
    expect(calls[0]?.headers['x-api-key']).toBe(API_KEY);
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({ query: 'query { events { id } }' });
  });

  test('serializes variables and operationName when provided', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: { ok: true } } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    await client.request(
      'query Q($id: ID!) { node(id: $id) }',
      { id: 'x' },
      {
        operationName: 'Q',
      },
    );
    expect(JSON.parse(calls[0]?.body ?? '{}')).toEqual({
      query: 'query Q($id: ID!) { node(id: $id) }',
      variables: { id: 'x' },
      operationName: 'Q',
    });
  });

  test('throws AppSyncGraphQLError when server returns errors', async () => {
    const { fetch } = fakeFetch({
      body: { data: null, errors: [{ message: 'boom' }, { message: 'whoops' }] },
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    await expect(client.request('query { x }')).rejects.toMatchObject({
      code: 'GRAPHQL_ERROR',
      message: expect.stringContaining('2 GraphQL errors'),
    });
  });

  test('does not throw on graphql errors when throwOnGraphQLError=false', async () => {
    const { fetch } = fakeFetch({
      body: { data: { partial: 1 }, errors: [{ message: 'partial failure' }] },
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    const data = await client.request('query { x }', undefined, { throwOnGraphQLError: false });
    expect(data).toEqual({ partial: 1 });
  });

  test('requestRaw returns full envelope', async () => {
    const { fetch } = fakeFetch({
      body: { data: { x: 1 }, errors: [{ message: 'meh' }], extensions: { trace: 'abc' } },
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    const env = await client.requestRaw('query { x }');
    expect(env.data).toEqual({ x: 1 });
    expect(env.errors).toEqual([{ message: 'meh' }]);
    expect(env.extensions).toEqual({ trace: 'abc' });
  });

  test('throws AppSyncHttpError on 4xx with parsed JSON body', async () => {
    const { fetch } = fakeFetch({
      status: 401,
      statusText: 'Unauthorized',
      body: { message: 'bad key' },
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'bad' },
      fetch,
      retry: { attempts: 1 },
    });
    const err = (await client.request('query { x }').catch((e) => e)) as AppSyncHttpError;
    expect(err).toBeInstanceOf(AppSyncHttpError);
    expect(err.status).toBe(401);
    expect(err.body).toEqual({ message: 'bad key' });
  });

  test('falls back to raw text when error body is not JSON', async () => {
    const { fetch } = fakeFetch({
      status: 502,
      statusText: 'Bad Gateway',
      rawBody: '<html>nope</html>',
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 1 },
    });
    const err = (await client.request('query { x }').catch((e) => e)) as AppSyncHttpError;
    expect(err.body).toBe('<html>nope</html>');
  });

  test('throws AppSyncNetworkError when fetch itself throws', async () => {
    const { fetch } = fakeFetch({ throws: new TypeError('ECONNREFUSED') });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 1 },
    });
    await expect(client.request('query { x }')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });

  test('throws AppSyncNetworkError when response is not valid JSON', async () => {
    const { fetch } = fakeFetch({ rawBody: 'not json' });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 1 },
    });
    await expect(client.request('query { x }')).rejects.toBeInstanceOf(AppSyncNetworkError);
  });

  test('merges client + per-request headers and lowercases them', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      headers: { 'X-Client-Tag': 'foo', 'X-Request-Id': 'a' },
    });
    await client.request('query { x }', undefined, {
      headers: { 'X-Request-Id': 'b', 'X-Trace': '1' },
    });
    expect(calls[0]?.headers['x-client-tag']).toBe('foo');
    expect(calls[0]?.headers['x-request-id']).toBe('b'); // per-request wins
    expect(calls[0]?.headers['x-trace']).toBe('1');
  });
});

describe('AppSyncClient — cancellation & timeouts', () => {
  test('AbortSignal cancels in-flight request', async () => {
    const { fetch } = fakeFetch({ delayMs: 1000, body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 1 },
    });
    const ac = new AbortController();
    const p = client.request('query { x }', undefined, { signal: ac.signal });
    setTimeout(() => ac.abort(), 5);
    const err = await p.catch((e) => e);
    expect(err).toBeInstanceOf(AppSyncAbortError);
    expect((err as AppSyncAbortError).reason).toBe('abort');
  });

  test('timeoutMs triggers an AppSyncAbortError with reason=timeout', async () => {
    const { fetch } = fakeFetch({ delayMs: 500, body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      timeoutMs: 20,
      retry: { attempts: 1 },
    });
    const err = (await client.request('query { x }').catch((e) => e)) as AppSyncAbortError;
    expect(err).toBeInstanceOf(AppSyncAbortError);
    expect(err.reason).toBe('timeout');
  });

  test('already-aborted signal short-circuits', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 1 },
    });
    const ac = new AbortController();
    ac.abort();
    await expect(
      client.request('query { x }', undefined, { signal: ac.signal }),
    ).rejects.toBeInstanceOf(AppSyncAbortError);
    // Fetch still gets called (with aborted signal) — assert it returns the abort path.
    expect(calls.length).toBeLessThanOrEqual(1);
  });
});

describe('AppSyncClient — retries', () => {
  test('retries on 5xx then succeeds', async () => {
    const { fetch, calls } = fakeFetch([
      { status: 503, statusText: 'Unavailable', body: { msg: 'try later' } },
      { status: 503, statusText: 'Unavailable', body: { msg: 'try later' } },
      { body: { data: { ok: true } } },
    ]);
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 3, baseDelayMs: 1, maxDelayMs: 5 },
    });
    const data = await client.request<{ ok: boolean }>('query { x }');
    expect(data.ok).toBe(true);
    expect(calls).toHaveLength(3);
  });

  test('gives up after `attempts` and throws the last error', async () => {
    const { fetch, calls } = fakeFetch({ status: 500, body: { msg: 'boom' } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 2, baseDelayMs: 1, maxDelayMs: 2 },
    });
    await expect(client.request('query { x }')).rejects.toBeInstanceOf(AppSyncHttpError);
    expect(calls).toHaveLength(2);
  });

  test('does not retry on 4xx by default', async () => {
    const { fetch, calls } = fakeFetch({ status: 400, body: { msg: 'bad' } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 5, baseDelayMs: 1 },
    });
    await expect(client.request('query { x }')).rejects.toBeInstanceOf(AppSyncHttpError);
    expect(calls).toHaveLength(1);
  });

  test('custom shouldRetry is honoured', async () => {
    const { fetch, calls } = fakeFetch([
      { status: 400, body: { msg: 'bad' } },
      { body: { data: { ok: true } } },
    ]);
    const shouldRetry = vi.fn(() => true);
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
      retry: { attempts: 3, baseDelayMs: 1, shouldRetry },
    });
    const data = await client.request<{ ok: boolean }>('query { x }');
    expect(data.ok).toBe(true);
    expect(calls).toHaveLength(2);
    expect(shouldRetry).toHaveBeenCalled();
  });
});

describe('AppSyncClient — convenience methods', () => {
  test('query() and mutate() forward to request()', async () => {
    const { fetch, calls } = fakeFetch([
      { body: { data: { a: 1 } } },
      { body: { data: { b: 2 } } },
    ]);
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    await client.query('query { a }');
    await client.mutate('mutation { b }');
    expect(calls).toHaveLength(2);
  });

  test('introspect() sends INTROSPECTION_QUERY', async () => {
    const { fetch, calls } = fakeFetch({
      body: { data: { __schema: { queryType: { name: 'Q' } } } },
    });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    const schema = await client.introspect();
    expect(schema.__schema.queryType.name).toBe('Q');
    expect(JSON.parse(calls[0]?.body ?? '{}').query).toContain('IntrospectionQuery');
  });
});

describe('AppSyncClient — error class metadata', () => {
  test('GraphQL error exposes data, errors, code, name', async () => {
    const { fetch } = fakeFetch({ body: { data: null, errors: [{ message: 'boom' }] } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: API_KEY },
      fetch,
    });
    const err = (await client.request('query { x }').catch((e) => e)) as AppSyncGraphQLError;
    expect(err.name).toBe('AppSyncGraphQLError');
    expect(err.code).toBe('GRAPHQL_ERROR');
    expect(err.errors[0]?.message).toBe('boom');
  });
});
