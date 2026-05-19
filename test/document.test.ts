import { parse } from 'graphql';
import { describe, expect, test } from 'vitest';
import { AppSyncClient } from '../src/index.ts';
import { fakeFetch } from './_fake-fetch.ts';

const URL_ = 'https://example.appsync-api.us-east-1.amazonaws.com/graphql';

describe('document handling', () => {
  test('accepts a parsed DocumentNode and extracts operationName automatically', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: { ok: true } } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'k' },
      fetch,
    });
    const doc = parse('query MyQuery { ok }');
    await client.request(doc);
    const body = JSON.parse(calls[0]?.body ?? '{}');
    expect(body.query).toContain('query MyQuery { ok }');
    expect(body.operationName).toBe('MyQuery');
  });

  test('handles an anonymous operation', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: { ok: true } } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'k' },
      fetch,
    });
    const doc = parse('query { ok }');
    await client.request(doc);
    const body = JSON.parse(calls[0]?.body ?? '{}');
    expect(body.operationName).toBeUndefined();
  });

  test('throws when given an AST without loc.source.body', async () => {
    const { fetch } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'k' },
      fetch,
    });
    const handcrafted = { kind: 'Document', definitions: [] } as never;
    await expect(client.request(handcrafted)).rejects.toThrow(/DocumentNode without/);
  });

  test('explicit operationName overrides the one in the document', async () => {
    const { fetch, calls } = fakeFetch({ body: { data: null } });
    const client = new AppSyncClient({
      url: URL_,
      auth: { type: 'apiKey', apiKey: 'k' },
      fetch,
    });
    const doc = parse('query A { a } query B { b }');
    await client.request(doc, undefined, { operationName: 'B' });
    expect(JSON.parse(calls[0]?.body ?? '{}').operationName).toBe('B');
  });
});
