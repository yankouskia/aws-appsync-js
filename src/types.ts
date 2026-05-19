import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { DocumentNode } from 'graphql';

/**
 * A GraphQL request document — either:
 *
 * - a plain string (`'query { me { id } }'`), in which case the response shape
 *   is whatever you say it is via the generic parameter to {@link AppSyncClient.request};
 * - a parsed {@link DocumentNode} from `graphql`;
 * - a {@link TypedDocumentNode} (e.g. produced by `graphql-codegen`), which lets
 *   the client *infer* both the response and variables types automatically.
 *
 * @template TData      The shape of `response.data`.
 * @template TVariables The shape of the variables object.
 */
export type AppSyncDocument<TData = unknown, TVariables = Variables> =
  | string
  | DocumentNode
  | TypedDocumentNode<TData, TVariables>;

/** A plain JSON-serializable variables object. */
export type Variables = Record<string, unknown>;

/** A single GraphQL error returned by the server (per the GraphQL spec). */
export interface GraphQLFormattedError {
  readonly message: string;
  readonly path?: ReadonlyArray<string | number>;
  readonly locations?: ReadonlyArray<{ readonly line: number; readonly column: number }>;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

/**
 * A successful GraphQL response. Note that GraphQL servers can return *both*
 * `data` and `errors` at the same time (partial success). When that happens,
 * the client will throw {@link AppSyncGraphQLError} by default — disable that
 * with `throwOnGraphQLError: false` to receive the raw response.
 */
export interface GraphQLResponse<TData = unknown> {
  readonly data?: TData;
  readonly errors?: ReadonlyArray<GraphQLFormattedError>;
  readonly extensions?: Readonly<Record<string, unknown>>;
}

/** Per-request options. All optional. */
export interface RequestOptions {
  /** Cancel the request. Composes with the client-wide signal if one is set. */
  readonly signal?: AbortSignal;
  /** Per-request timeout (ms). Overrides the client default. `0` disables. */
  readonly timeoutMs?: number;
  /** Extra HTTP headers, merged on top of the auth/default headers. */
  readonly headers?: Readonly<Record<string, string>>;
  /**
   * If `true` (default), throw {@link AppSyncGraphQLError} when the server
   * returns a non-empty `errors` array. Set to `false` to receive the raw
   * `{ data, errors }` response instead.
   */
  readonly throwOnGraphQLError?: boolean;
  /**
   * Override the operation name sent to AppSync. Useful when a single document
   * contains multiple operations.
   */
  readonly operationName?: string;
}

/** Retry policy. */
export interface RetryOptions {
  /** Total attempts (including the first). Default `3`. Set `1` to disable. */
  readonly attempts?: number;
  /** Initial backoff in ms. Default `200`. */
  readonly baseDelayMs?: number;
  /** Cap for backoff (ms). Default `5_000`. */
  readonly maxDelayMs?: number;
  /**
   * Decide whether to retry a given error. Default: retry network errors and
   * 5xx / 429 HTTP statuses.
   */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/** Fetch implementation. Defaults to the global `fetch`. */
export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

/** All AppSync auth modes (mirrors the strings AWS uses in the console). */
export const AUTH_MODE = {
  API_KEY: 'API_KEY',
  AWS_IAM: 'AWS_IAM',
  AMAZON_COGNITO_USER_POOLS: 'AMAZON_COGNITO_USER_POOLS',
  OPENID_CONNECT: 'OPENID_CONNECT',
  AWS_LAMBDA: 'AWS_LAMBDA',
} as const;

export type AuthModeName = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];

/**
 * @deprecated since v1.0.0 — use the string literals on {@link AUTH_MODE} or
 * the discriminated `auth.type` field directly. Re-exported only so v0.x users
 * can upgrade without immediate code changes; this alias will be removed in v2.
 */
export const authMode = {
  API_KEY_MODE: AUTH_MODE.API_KEY,
  AWS_IAM: AUTH_MODE.AWS_IAM,
  AMAZON_COGNITO_USER_POOLS: AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
} as const;

/** Discriminated union of every supported auth configuration. */
export type AuthConfig = ApiKeyAuth | IamAuth | CognitoAuth | OidcAuth | LambdaAuth;

export interface ApiKeyAuth {
  readonly type: 'apiKey';
  /** Your AppSync API key, e.g. `da2-abcdef...`. */
  readonly apiKey: string;
}

export interface CognitoAuth {
  readonly type: 'cognito';
  /**
   * The Cognito User Pools JWT to attach as the `Authorization` header, or a
   * function returning one (sync or async). Use the function form to refresh
   * silently-expired tokens.
   */
  readonly jwtToken: string | (() => string | Promise<string>);
}

export interface OidcAuth {
  readonly type: 'oidc';
  /** The OpenID Connect JWT, or a function returning one. */
  readonly jwtToken: string | (() => string | Promise<string>);
}

export interface LambdaAuth {
  readonly type: 'lambda';
  /** The token your Lambda authorizer expects, or a function returning one. */
  readonly authorizationToken: string | (() => string | Promise<string>);
}

export interface IamAuth {
  readonly type: 'iam';
  /** AWS region the AppSync API lives in, e.g. `'us-east-1'`. */
  readonly region: string;
  /** AWS credentials, or a function returning fresh credentials per request. */
  readonly credentials: AwsCredentials | (() => AwsCredentials | Promise<AwsCredentials>);
}

export interface AwsCredentials {
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly sessionToken?: string;
}

/** Constructor options for {@link AppSyncClient}. */
export interface AppSyncClientOptions {
  /** AppSync GraphQL endpoint, e.g. `https://abc.appsync-api.us-east-1.amazonaws.com/graphql`. */
  readonly url: string;
  /** Authentication strategy. See {@link AuthConfig}. */
  readonly auth: AuthConfig;
  /** Extra HTTP headers attached to every request. */
  readonly headers?: Readonly<Record<string, string>>;
  /** Default request timeout in ms. Defaults to `30_000`. `0` disables. */
  readonly timeoutMs?: number;
  /** Default retry policy. */
  readonly retry?: RetryOptions;
  /** Override the global `fetch`. Mostly useful for tests / edge runtimes. */
  readonly fetch?: FetchLike;
  /** Abort all in-flight requests. */
  readonly signal?: AbortSignal;
}
