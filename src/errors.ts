import type { GraphQLFormattedError } from './types.ts';

/**
 * Base class for every error this library throws. Catch this if you want a
 * single `catch` block; switch on `instanceof` (or `error.code`) when you need
 * to distinguish cases.
 *
 * Every concrete subclass sets a stable `code` you can branch on without
 * relying on `instanceof` checks across module boundaries.
 */
export abstract class AppSyncError extends Error {
  /** A stable, machine-readable error code. */
  abstract readonly code: string;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

/**
 * Thrown when the network request itself failed — DNS, TCP, CORS, or `fetch`
 * threw. The original error is on `cause`.
 */
export class AppSyncNetworkError extends AppSyncError {
  readonly code = 'NETWORK_ERROR' as const;
}

/**
 * Thrown when the request was cancelled via `AbortSignal` or hit the configured
 * timeout. `reason` is `'timeout'` for the timeout case, `'abort'` otherwise.
 */
export class AppSyncAbortError extends AppSyncError {
  readonly code = 'ABORTED' as const;
  readonly reason: 'timeout' | 'abort';

  constructor(reason: 'timeout' | 'abort', options?: { cause?: unknown }) {
    super(reason === 'timeout' ? 'Request timed out' : 'Request was aborted', options);
    this.reason = reason;
  }
}

/**
 * Thrown when AppSync returns a non-2xx HTTP status. `status` and (when JSON)
 * `body` are populated so you can build a meaningful error UI.
 */
export class AppSyncHttpError extends AppSyncError {
  readonly code = 'HTTP_ERROR' as const;
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`AppSync returned HTTP ${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/**
 * Thrown when the response is HTTP 200 but contains a non-empty `errors` array.
 * Inspect `errors` for the per-field details and `data` for whatever the server
 * managed to return.
 */
export class AppSyncGraphQLError<TData = unknown> extends AppSyncError {
  readonly code = 'GRAPHQL_ERROR' as const;
  readonly errors: ReadonlyArray<GraphQLFormattedError>;
  readonly data: TData | undefined;

  constructor(errors: ReadonlyArray<GraphQLFormattedError>, data: TData | undefined) {
    super(
      errors.length === 1
        ? `GraphQL error: ${errors[0]?.message}`
        : `${errors.length} GraphQL errors (first: ${errors[0]?.message})`,
    );
    this.errors = errors;
    this.data = data;
  }
}
