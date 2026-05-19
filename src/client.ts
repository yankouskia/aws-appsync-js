import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { DocumentNode } from 'graphql';
import { buildAuthHeaders } from './auth.ts';
import {
  AppSyncAbortError,
  AppSyncError,
  AppSyncGraphQLError,
  AppSyncHttpError,
  AppSyncNetworkError,
} from './errors.ts';
import { INTROSPECTION_QUERY, type IntrospectionResult } from './introspection.ts';
import type {
  AppSyncClientOptions,
  AppSyncDocument,
  FetchLike,
  GraphQLResponse,
  RequestOptions,
  RetryOptions,
  Variables,
} from './types.ts';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRY: Required<Omit<RetryOptions, 'shouldRetry'>> = {
  attempts: 3,
  baseDelayMs: 200,
  maxDelayMs: 5_000,
};

/**
 * A tiny, fully-typed AWS AppSync GraphQL client.
 *
 * ```ts
 * import { AppSyncClient } from 'aws-appsync-js';
 *
 * const client = new AppSyncClient({
 *   url: 'https://abc.appsync-api.us-east-1.amazonaws.com/graphql',
 *   auth: { type: 'apiKey', apiKey: 'da2-...' },
 * });
 *
 * const { events } = await client.request<{ events: Event[] }>(`
 *   query { events { id name } }
 * `);
 * ```
 */
export class AppSyncClient {
  readonly #options: AppSyncClientOptions;
  readonly #fetch: FetchLike;

  constructor(options: AppSyncClientOptions) {
    if (!options?.url) {
      throw new TypeError('AppSyncClient: `url` is required.');
    }
    if (!options.auth) {
      throw new TypeError('AppSyncClient: `auth` is required.');
    }
    this.#options = options;
    const f = options.fetch ?? globalThis.fetch;
    if (typeof f !== 'function') {
      throw new TypeError(
        'AppSyncClient: no `fetch` implementation available. Pass one via `options.fetch` or upgrade to Node >= 18.',
      );
    }
    this.#fetch = f;
  }

  /**
   * Send a GraphQL operation (query or mutation) to AppSync.
   *
   * @returns The `data` payload, **not** the full response envelope.
   * Pass `{ throwOnGraphQLError: false }` if you need the raw response.
   *
   * @throws {@link AppSyncGraphQLError} when the server returns `errors`.
   * @throws {@link AppSyncHttpError} on a non-2xx HTTP response.
   * @throws {@link AppSyncNetworkError} when `fetch` itself rejects.
   * @throws {@link AppSyncAbortError} when the request is aborted or times out.
   *
   * @example Plain string query
   * ```ts
   * const data = await client.request<{ me: { id: string } }>(`query { me { id } }`);
   * ```
   *
   * @example TypedDocumentNode (full inference, zero hand-written types)
   * ```ts
   * import { GetUserDocument } from './generated/graphql';
   * const data = await client.request(GetUserDocument, { id: '1' });
   * //    ^? GetUserQuery
   * ```
   */
  request<TData, TVariables extends Variables>(
    document: TypedDocumentNode<TData, TVariables>,
    variables: TVariables,
    options?: RequestOptions,
  ): Promise<TData>;
  request<TData, TVariables extends Variables = Variables>(
    document: TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
    options?: RequestOptions,
  ): Promise<TData>;
  request<TData = unknown, TVariables extends Variables = Variables>(
    document: string | DocumentNode,
    variables?: TVariables,
    options?: RequestOptions,
  ): Promise<TData>;
  async request<TData = unknown, TVariables extends Variables = Variables>(
    document: AppSyncDocument<TData, TVariables>,
    variables?: TVariables,
    options: RequestOptions = {},
  ): Promise<TData> {
    const response = await this.requestRaw<TData, TVariables>(document, variables, options);
    if (response.errors && response.errors.length > 0 && options.throwOnGraphQLError !== false) {
      throw new AppSyncGraphQLError(response.errors, response.data);
    }
    return response.data as TData;
  }

  /**
   * Identical to {@link request} but returns the full `{ data, errors, extensions }`
   * envelope without throwing on GraphQL errors. Useful when you need partial
   * data or want to inspect every error individually.
   */
  async requestRaw<TData = unknown, TVariables extends Variables = Variables>(
    document: AppSyncDocument<TData, TVariables>,
    variables?: TVariables,
    options: RequestOptions = {},
  ): Promise<GraphQLResponse<TData>> {
    const query = typeof document === 'string' ? document : printDocument(document);
    const operationName =
      options.operationName ??
      (typeof document === 'object' && document !== null
        ? extractOperationName(document)
        : undefined);
    const body = JSON.stringify({
      query,
      ...(variables !== undefined ? { variables } : {}),
      ...(operationName ? { operationName } : {}),
    });
    return this.#executeWithRetry<TData>(body, options);
  }

  /** Convenience alias for {@link request} — purely for code that prefers it. */
  query<TData = unknown, TVariables extends Variables = Variables>(
    document: AppSyncDocument<TData, TVariables>,
    variables?: TVariables,
    options?: RequestOptions,
  ): Promise<TData> {
    return this.request<TData, TVariables>(document as never, variables as never, options);
  }

  /** Convenience alias for {@link request}. */
  mutate<TData = unknown, TVariables extends Variables = Variables>(
    document: AppSyncDocument<TData, TVariables>,
    variables?: TVariables,
    options?: RequestOptions,
  ): Promise<TData> {
    return this.request<TData, TVariables>(document as never, variables as never, options);
  }

  /**
   * Run the standard GraphQL introspection query against the endpoint.
   * Returned shape mirrors `graphql-js`'s `IntrospectionQuery`.
   */
  introspect(options?: RequestOptions): Promise<IntrospectionResult> {
    return this.request<IntrospectionResult>(INTROSPECTION_QUERY, undefined, options);
  }

  async #executeWithRetry<TData>(
    body: string,
    options: RequestOptions,
  ): Promise<GraphQLResponse<TData>> {
    const retry = { ...DEFAULT_RETRY, ...this.#options.retry };
    const shouldRetry = this.#options.retry?.shouldRetry ?? defaultShouldRetry;
    let lastErr: unknown;

    for (let attempt = 1; attempt <= retry.attempts; attempt++) {
      try {
        return await this.#executeOnce<TData>(body, options);
      } catch (err) {
        lastErr = err;
        if (attempt === retry.attempts || !shouldRetry(err, attempt)) {
          throw err;
        }
        await sleep(backoff(attempt, retry.baseDelayMs, retry.maxDelayMs));
      }
    }
    throw lastErr;
  }

  async #executeOnce<TData>(
    body: string,
    options: RequestOptions,
  ): Promise<GraphQLResponse<TData>> {
    const authHeaders = await buildAuthHeaders(this.#options.auth, {
      url: this.#options.url,
      body,
    });
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=UTF-8',
      accept: 'application/json',
      ...authHeaders,
      ...lower(this.#options.headers),
      ...lower(options.headers),
    };

    const timeoutMs = options.timeoutMs ?? this.#options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const { signal, cancel } = composeSignals(
      [this.#options.signal, options.signal],
      timeoutMs > 0 ? timeoutMs : undefined,
    );

    let response: Response;
    try {
      response = await this.#fetch(this.#options.url, {
        method: 'POST',
        headers,
        body,
        signal,
      });
    } catch (err) {
      cancel();
      if (isAbortLike(err)) {
        throw new AppSyncAbortError(timedOut(signal, timeoutMs) ? 'timeout' : 'abort', {
          cause: err,
        });
      }
      throw new AppSyncNetworkError('Network request failed', { cause: err });
    } finally {
      cancel();
    }

    if (!response.ok) {
      const bodyText = await safeText(response);
      throw new AppSyncHttpError(response.status, response.statusText, tryParseJson(bodyText));
    }

    let parsed: GraphQLResponse<TData>;
    try {
      parsed = (await response.json()) as GraphQLResponse<TData>;
    } catch (err) {
      throw new AppSyncNetworkError('Failed to parse AppSync response as JSON', { cause: err });
    }
    return parsed;
  }
}

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof AppSyncHttpError) {
    return error.status === 429 || (error.status >= 500 && error.status <= 599);
  }
  if (error instanceof AppSyncNetworkError) return true;
  if (error instanceof AppSyncAbortError) return false;
  if (error instanceof AppSyncError) return false;
  return false;
}

function backoff(attempt: number, base: number, cap: number): number {
  const exp = Math.min(cap, base * 2 ** (attempt - 1));
  return Math.floor(Math.random() * exp);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function lower(h: Readonly<Record<string, string>> | undefined): Record<string, string> {
  if (!h) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) out[k.toLowerCase()] = v;
  return out;
}

function composeSignals(
  signals: ReadonlyArray<AbortSignal | undefined>,
  timeoutMs?: number,
): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const cleanups: Array<() => void> = [];

  for (const s of signals) {
    if (!s) continue;
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    const onAbort = () => controller.abort(s.reason);
    s.addEventListener('abort', onAbort, { once: true });
    cleanups.push(() => s.removeEventListener('abort', onAbort));
  }

  if (timeoutMs && timeoutMs > 0) {
    const t = setTimeout(
      () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
      timeoutMs,
    );
    cleanups.push(() => clearTimeout(t));
  }

  return {
    signal: controller.signal,
    cancel: () => {
      for (const c of cleanups) c();
    },
  };
}

function timedOut(signal: AbortSignal, timeoutMs: number): boolean {
  if (timeoutMs <= 0) return false;
  const reason = signal.reason as { name?: string } | undefined;
  return reason?.name === 'TimeoutError';
}

function isAbortLike(err: unknown): boolean {
  return (
    err instanceof Error &&
    (err.name === 'AbortError' || err.name === 'TimeoutError' || err.name === 'DOMException')
  );
}

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return '';
  }
}

function tryParseJson(s: string): unknown {
  if (!s) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function printDocument(doc: DocumentNode | TypedDocumentNode<unknown, unknown>): string {
  if ('loc' in doc && doc.loc?.source?.body) return doc.loc.source.body;
  // Minimal printer fallback — if a caller hands us a DocumentNode produced by
  // hand (no `loc`), we ask them to print it themselves. This avoids dragging
  // `graphql/printer` into the runtime bundle.
  throw new TypeError(
    'AppSyncClient: received a DocumentNode without `loc.source.body`. ' +
      "Either pass the query as a string, or convert the AST with `graphql`'s `print()` first.",
  );
}

function extractOperationName(
  doc: DocumentNode | TypedDocumentNode<unknown, unknown>,
): string | undefined {
  const defs = (doc as DocumentNode).definitions ?? [];
  for (const def of defs) {
    if (def.kind === 'OperationDefinition' && def.name?.value) return def.name.value;
  }
  return undefined;
}
