import { describe, expect, test, vi } from 'vitest';
import { AppSyncClient } from '../src/index.ts';
import { fakeFetch } from './_fake-fetch.ts';

const URL_ = 'https://example.appsync-api.us-east-1.amazonaws.com/graphql';

describe('auth — API_KEY', () => {
  test('sends x-api-key header', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'da2-xyz' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['x-api-key']).toBe('da2-xyz');
    expect(calls[0]?.headers['authorization']).toBeUndefined();
  });
});

describe('auth — COGNITO / OIDC', () => {
  test('cognito: adds Bearer prefix when missing', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'cognito', jwtToken: 'eyJtoken' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['authorization']).toBe('Bearer eyJtoken');
  });

  test('cognito: keeps existing Bearer prefix as-is', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'cognito', jwtToken: 'Bearer abc' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['authorization']).toBe('Bearer abc');
  });

  test('cognito: supports an async token provider', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const provider = vi.fn(async () => 'fresh-token');
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'cognito', jwtToken: provider },
      fetch,
    });
    await client.request('query { x }');
    await client.request('query { x }');
    expect(provider).toHaveBeenCalledTimes(2); // called per-request
    expect(calls[1]?.headers['authorization']).toBe('Bearer fresh-token');
  });

  test('oidc: same Bearer behaviour as cognito', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'oidc', jwtToken: 'oidc-jwt' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['authorization']).toBe('Bearer oidc-jwt');
  });
});

describe('auth — AWS_LAMBDA', () => {
  test('forwards token verbatim (no Bearer prefix added)', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'lambda', authorizationToken: 'custom-opaque' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['authorization']).toBe('custom-opaque');
  });

  test('supports an async token provider', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'lambda', authorizationToken: async () => 'lambda-fresh' },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['authorization']).toBe('lambda-fresh');
  });
});

describe('auth — AWS_IAM (SigV4)', () => {
  test('signs the request with the expected headers', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: {
        type: 'iam',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'AKIAEXAMPLE',
          secretAccessKey: 'SECRET',
          sessionToken: 'session-token',
        },
      },
      fetch,
    });
    await client.request('query { x }');
    const h = calls[0]?.headers ?? {};
    expect(h['authorization']).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE\//);
    expect(h['authorization']).toContain('/us-east-1/appsync/aws4_request');
    expect(h['authorization']).toContain('Signature=');
    expect(h['authorization']).toContain('SignedHeaders=');
    expect(h['x-amz-date']).toMatch(/^\d{8}T\d{6}Z$/);
    expect(h['x-amz-security-token']).toBe('session-token');
  });

  test('omits x-amz-security-token when no sessionToken given', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: {
        type: 'iam',
        region: 'us-west-2',
        credentials: { accessKeyId: 'AKIA', secretAccessKey: 'SK' },
      },
      fetch,
    });
    await client.request('query { x }');
    expect(calls[0]?.headers['x-amz-security-token']).toBeUndefined();
    expect(calls[0]?.headers['authorization']).toContain('/us-west-2/appsync/aws4_request');
  });

  test('credentials function is called for each request', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    let counter = 0;
    const credentials = vi.fn(async () => ({
      accessKeyId: `AKIA${counter++}`,
      secretAccessKey: 'SK',
    }));
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'iam', region: 'eu-west-1', credentials },
      fetch,
    });
    await client.request('query { x }');
    await client.request('query { x }');
    expect(credentials).toHaveBeenCalledTimes(2);
    expect(calls[0]?.headers['authorization']).toContain('AKIA0/');
    expect(calls[1]?.headers['authorization']).toContain('AKIA1/');
  });

  test('SigV4: signature is deterministic and structurally valid', async () => {
    const { signAppSyncRequest } = await import('../src/sigv4.ts');
    const args = {
      url: 'https://example.appsync-api.us-east-1.amazonaws.com/graphql',
      body: JSON.stringify({ query: 'query { x }' }),
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'AKIDEXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
      },
      now: new Date('2024-01-01T00:00:00Z'),
    };
    const a = signAppSyncRequest(args);
    const b = signAppSyncRequest(args);

    // Determinism: identical inputs MUST yield byte-identical output.
    expect(a).toEqual(b);

    // Structure: matches AWS's documented `Authorization` format.
    expect(a['authorization']).toMatch(
      /^AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE\/20240101\/us-east-1\/appsync\/aws4_request, SignedHeaders=accept;content-encoding;content-type;host;x-amz-date, Signature=[0-9a-f]{64}$/,
    );
    expect(a['x-amz-date']).toBe('20240101T000000Z');
    expect(a['host']).toBeUndefined(); // host stripped because fetch reserves it
  });
});
