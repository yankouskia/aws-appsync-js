---
id: error-handling
title: Error handling
sidebar_position: 7
description: The full taxonomy of errors thrown by aws-appsync-js — what each one means and how to handle it.
---

# Error handling

`aws-appsync-js` throws **typed** error classes. Catch the base class for a single `catch` block, or `instanceof` the specific subclass when you need to discriminate. Each error also has a stable `code` field you can branch on across module boundaries.

```mermaid
flowchart TD
    A[AppSyncError <i>(abstract)</i>] --> B[AppSyncNetworkError<br/>code: NETWORK_ERROR]
    A --> C[AppSyncAbortError<br/>code: ABORTED]
    A --> D[AppSyncHttpError<br/>code: HTTP_ERROR]
    A --> E[AppSyncGraphQLError<br/>code: GRAPHQL_ERROR]
```

## The taxonomy

### `AppSyncNetworkError`

The HTTP request itself failed — DNS lookup, TCP connect, TLS handshake, CORS preflight, or `fetch` rejected. The underlying error is on `.cause`.

```ts
catch (err) {
  if (err instanceof AppSyncNetworkError) {
    console.log(err.message, err.cause);
  }
}
```

Retried by default (network errors are usually transient).

### `AppSyncAbortError`

The request was cancelled via `AbortSignal` or hit the configured timeout. `reason` distinguishes the two:

```ts
catch (err) {
  if (err instanceof AppSyncAbortError) {
    return err.reason === 'timeout' ? 'too slow' : 'user cancelled';
  }
}
```

**Not** retried by default — abort is a deliberate signal.

### `AppSyncHttpError`

AppSync returned a non-2xx status. The status code and the parsed body (if it was JSON) are on the error so you can build a meaningful UI:

```ts
catch (err) {
  if (err instanceof AppSyncHttpError) {
    console.log(err.status, err.statusText, err.body);
    if (err.status === 401) return refreshTokenAndRetry();
    if (err.status === 403) return showAccessDeniedScreen();
  }
}
```

Retried by default on **5xx** and **429**.

### `AppSyncGraphQLError`

HTTP was 200 but the server returned a non-empty `errors` array. Per the GraphQL spec, partial data is allowed — you'll find it on `.data`:

```ts
catch (err) {
  if (err instanceof AppSyncGraphQLError) {
    // err.errors is GraphQLFormattedError[]
    for (const e of err.errors) {
      console.error(e.message, e.path, e.extensions);
    }
    // err.data may be partially populated
    renderPartial(err.data);
  }
}
```

**Not** retried by default — GraphQL errors are usually deterministic (invalid input, unauthorized field, …).

## Picking the right catch

```ts
import {
  AppSyncError,            // base class
  AppSyncNetworkError,
  AppSyncAbortError,
  AppSyncHttpError,
  AppSyncGraphQLError,
} from 'aws-appsync-js';

try {
  return await client.request(query);
} catch (err) {
  if (err instanceof AppSyncGraphQLError) return handleGraphQL(err);
  if (err instanceof AppSyncHttpError)    return handleHttp(err);
  if (err instanceof AppSyncAbortError)   return handleAbort(err);
  if (err instanceof AppSyncNetworkError) return handleNetwork(err);
  if (err instanceof AppSyncError)        return handleUnknown(err);
  throw err; // not from this library — rethrow
}
```

## Switching on `code` instead of `instanceof`

When you're crossing module boundaries (different packages, micro-frontends, server↔browser), `instanceof` can fail because the class identities are duplicated. Switching on `code` works regardless:

```ts
switch ((err as { code?: string }).code) {
  case 'GRAPHQL_ERROR': /* … */ break;
  case 'HTTP_ERROR':    /* … */ break;
  case 'ABORTED':       /* … */ break;
  case 'NETWORK_ERROR': /* … */ break;
}
```

## Common GraphQL `errorType` values from AppSync

AppSync embeds an `errorType` in `extensions` you can inspect:

| `errorType`                  | Meaning                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `Unauthorized`               | `@auth` rule denied the field                                 |
| `MissingAuthenticationToken` | No auth header sent (or wrong header for the configured mode) |
| `ExecutionTimeout`           | Resolver took longer than the configured timeout              |
| `Throttling`                 | Per-API or per-resolver throttle limit hit                    |
| `DynamoDB:ConditionalCheckFailedException` | The classic conditional-update conflict          |

```ts
for (const e of err.errors) {
  if (e.extensions?.['errorType'] === 'Throttling') {
    await sleep(1000);
    return retry();
  }
}
```

## What you don't have to write

- No try/catch boilerplate to parse the AppSync error envelope — that's done for you.
- No string-matching on error messages — every error has `code` and (where relevant) `status`, `reason`, or `errors`.
- No second `try/catch` for JSON parse failures — those surface as `AppSyncNetworkError` with the JSON-parse error on `.cause`.
