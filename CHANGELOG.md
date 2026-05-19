# aws-appsync-js

## 2.0.0

### Major Changes

- [`57ed3a3`](https://github.com/yankouskia/aws-appsync-js/commit/57ed3a33a1cdd1fd5837b9ea2aab9216d0ae8d2d) - **v1.0.0 — full modernization.** Rewritten as strict TypeScript with end-to-end
  type inference (via `TypedDocumentNode`), zero runtime dependencies, dual ESM +
  CJS publish with proper `exports` map, and full coverage of all five AppSync
  auth modes (`API_KEY`, `AWS_IAM`, `AMAZON_COGNITO_USER_POOLS`, `OPENID_CONNECT`,
  `AWS_LAMBDA`). Adds AbortSignal support, configurable timeouts, retry with
  exponential backoff, typed error classes (`AppSyncNetworkError`,
  `AppSyncHttpError`, `AppSyncGraphQLError`, `AppSyncAbortError`), and an
  introspection helper.

  See `BREAKING_CHANGES.md` for the (small) migration notes.
