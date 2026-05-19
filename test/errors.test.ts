import { describe, expect, test } from 'vitest';
import {
  AppSyncAbortError,
  AppSyncError,
  AppSyncGraphQLError,
  AppSyncHttpError,
  AppSyncNetworkError,
} from '../src/errors.ts';

describe('error classes', () => {
  test('all extend AppSyncError and carry a stable code', () => {
    const cases = [
      [new AppSyncNetworkError('n'), 'NETWORK_ERROR'],
      [new AppSyncAbortError('timeout'), 'ABORTED'],
      [new AppSyncHttpError(500, 'Server Error', null), 'HTTP_ERROR'],
      [new AppSyncGraphQLError([{ message: 'x' }], undefined), 'GRAPHQL_ERROR'],
    ] as const;
    for (const [err, code] of cases) {
      expect(err).toBeInstanceOf(AppSyncError);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe(code);
      expect(err.name).toBe(err.constructor.name);
    }
  });

  test('AppSyncAbortError reports timeout vs abort', () => {
    expect(new AppSyncAbortError('timeout').message).toMatch(/timed out/);
    expect(new AppSyncAbortError('abort').message).toMatch(/aborted/);
  });

  test('AppSyncHttpError carries status, statusText, body', () => {
    const e = new AppSyncHttpError(429, 'Too Many Requests', { wait: 60 });
    expect(e.status).toBe(429);
    expect(e.statusText).toBe('Too Many Requests');
    expect(e.body).toEqual({ wait: 60 });
  });

  test('AppSyncGraphQLError message format depends on count', () => {
    expect(new AppSyncGraphQLError([{ message: 'one' }], undefined).message).toMatch(
      /^GraphQL error: one/,
    );
    expect(
      new AppSyncGraphQLError([{ message: 'a' }, { message: 'b' }], undefined).message,
    ).toMatch(/^2 GraphQL errors/);
  });

  test('cause is preserved (Error.cause)', () => {
    const root = new TypeError('root');
    const e = new AppSyncNetworkError('wrap', { cause: root });
    expect(e.cause).toBe(root);
  });
});
