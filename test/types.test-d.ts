import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { AUTH_MODE, type AppSyncClient, type AuthConfig } from '../src/index.ts';

declare const client: AppSyncClient;

describe('TypedDocumentNode inference', () => {
  test('a TypedDocumentNode with variables — both data and variables are inferred', () => {
    type Vars = { id: string };
    type Data = { user: { id: string; name: string } };
    const doc = {} as TypedDocumentNode<Data, Vars>;

    const result = client.request(doc, { id: '1' });
    expectTypeOf(result).toEqualTypeOf<Promise<Data>>();
  });

  test('a TypedDocumentNode without variables — variables are optional', () => {
    type Data = { ok: boolean };
    const doc = {} as TypedDocumentNode<Data, Record<string, never>>;

    const result = client.request(doc);
    expectTypeOf(result).toEqualTypeOf<Promise<Data>>();
  });

  test('plain string with explicit generic', () => {
    const result = client.request<{ x: number }>('query { x }');
    expectTypeOf(result).toEqualTypeOf<Promise<{ x: number }>>();
  });

  test('plain string with no generic falls back to unknown', () => {
    const result = client.request('query { x }');
    expectTypeOf(result).toEqualTypeOf<Promise<unknown>>();
  });
});

describe('AuthConfig discriminated union', () => {
  test('apiKey requires apiKey', () => {
    assertType<AuthConfig>({ type: 'apiKey', apiKey: 'da2-x' });
    // @ts-expect-error missing apiKey
    assertType<AuthConfig>({ type: 'apiKey' });
  });

  test('iam requires region and credentials', () => {
    assertType<AuthConfig>({
      type: 'iam',
      region: 'us-east-1',
      credentials: { accessKeyId: 'x', secretAccessKey: 'y' },
    });
    // @ts-expect-error missing region
    assertType<AuthConfig>({
      type: 'iam',
      credentials: { accessKeyId: 'x', secretAccessKey: 'y' },
    });
  });

  test('AUTH_MODE constants match the docs', () => {
    expectTypeOf(AUTH_MODE.API_KEY).toEqualTypeOf<'API_KEY'>();
    expectTypeOf(AUTH_MODE.AWS_IAM).toEqualTypeOf<'AWS_IAM'>();
    expectTypeOf(AUTH_MODE.AMAZON_COGNITO_USER_POOLS).toEqualTypeOf<'AMAZON_COGNITO_USER_POOLS'>();
    expectTypeOf(AUTH_MODE.OPENID_CONNECT).toEqualTypeOf<'OPENID_CONNECT'>();
    expectTypeOf(AUTH_MODE.AWS_LAMBDA).toEqualTypeOf<'AWS_LAMBDA'>();
  });
});
