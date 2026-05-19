/**
 * `aws-appsync-js` — a tiny, fully-typed AWS AppSync GraphQL client.
 *
 * @packageDocumentation
 */

export { AppSyncClient } from './client.ts';

export {
  AppSyncError,
  AppSyncNetworkError,
  AppSyncHttpError,
  AppSyncGraphQLError,
  AppSyncAbortError,
} from './errors.ts';

export {
  AUTH_MODE,
  authMode,
} from './types.ts';

export type {
  // Core
  AppSyncClientOptions,
  AppSyncDocument,
  Variables,
  RequestOptions,
  RetryOptions,
  FetchLike,
  GraphQLResponse,
  GraphQLFormattedError,
  // Auth
  AuthConfig,
  AuthModeName,
  ApiKeyAuth,
  IamAuth,
  CognitoAuth,
  OidcAuth,
  LambdaAuth,
  AwsCredentials,
} from './types.ts';

export type {
  IntrospectionResult,
  IntrospectionType,
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionTypeRef,
  IntrospectionEnumValue,
  IntrospectionDirective,
} from './introspection.ts';

export { INTROSPECTION_QUERY } from './introspection.ts';

/**
 * Default export retained as an alias for {@link AppSyncClient} so v0.x users
 * who did `import AppSyncClient from 'aws-appsync-js'` continue to work for
 * one major version. Prefer the named export going forward.
 *
 * @deprecated since v1.0.0 — use the named `AppSyncClient` export.
 */
export { AppSyncClient as default } from './client.ts';
