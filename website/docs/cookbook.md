---
id: cookbook
title: Cookbook
sidebar_position: 6
description: Recipes for retries, timeouts, cancellation, observability, partial responses, custom fetch, and more.
---

# Cookbook

Small, copy-pasteable recipes for the 10 % of use cases that aren't `client.request(query)`.

## Cancel a request

```ts
const controller = new AbortController();
const promise = client.request(query, vars, { signal: controller.signal });

setTimeout(() => controller.abort(), 100);

await promise.catch((err) => {
  if (err.code === 'ABORTED') {
    // user-cancelled or timed out
  }
});
```

If you compose multiple signals — say one for "page navigated away" and one for "user clicked cancel" — pass either, the client will respect whichever fires first.

## Per-call timeout

```ts
await client.request(query, vars, { timeoutMs: 2_000 });
```

`timeoutMs: 0` disables the timeout for that call. The client default is **30 seconds** and can be overridden globally on the constructor.

## Customize retries

```ts
const client = new AppSyncClient({
  url,
  auth,
  retry: {
    attempts: 5,           // total attempts including the first
    baseDelayMs: 250,      // exponential backoff seed
    maxDelayMs: 8_000,     // cap
    shouldRetry: (err, attempt) =>
      err instanceof AppSyncHttpError && err.status === 503 && attempt < 5,
  },
});
```

`shouldRetry` defaults to retrying network errors, HTTP 5xx, and 429. Override it to add your own classifier (idempotency keys, specific GraphQL `errorType` values, …).

## Read partial data (don't throw on GraphQL errors)

GraphQL servers can return both `data` and `errors` for partial successes. `aws-appsync-js` throws by default; use `requestRaw` when you need the partial payload:

```ts
const { data, errors } = await client.requestRaw(query);
if (errors) reportToSentry(errors);
render(data); // may be partially populated
```

Or per-call:

```ts
const response = await client.request(query, undefined, {
  throwOnGraphQLError: false,
});
```

## Inject a custom `fetch`

Wrap the global `fetch` for tracing, retries on top of the client's, or to provide `fetch` in environments that don't expose one globally:

```ts
import { trace } from '@opentelemetry/api';

const client = new AppSyncClient({
  url,
  auth,
  fetch: async (input, init) => {
    const span = trace.getTracer('appsync').startSpan('appsync.request');
    try {
      return await fetch(input, init);
    } finally {
      span.end();
    }
  },
});
```

## Add headers

Per-client or per-request, your headers override the defaults — but the auth headers are always written last, so you can't accidentally clobber them:

```ts
const client = new AppSyncClient({
  url,
  auth,
  headers: { 'x-request-id': () => crypto.randomUUID() }, // overwritten per call below
});

await client.request(query, vars, {
  headers: { 'x-feature-flag': 'beta' },
});
```

## Get the introspection schema

Useful for build-time codegen, GraphiQL, schema diffing in CI, etc.:

```ts
import { writeFile } from 'node:fs/promises';

const schema = await client.introspect();
await writeFile('./schema.json', JSON.stringify(schema));
```

## Mutation aliases

`client.query()` and `client.mutate()` are pure aliases of `client.request()` if you prefer them:

```ts
await client.query(GetThingDocument, { id });
await client.mutate(CreateThingDocument, { input });
```

## Pair with a state library

`aws-appsync-js` is a transport, not a cache. Pair it with whatever you already use:

```ts title="TanStack Query"
useQuery({
  queryKey: ['user', id],
  queryFn: ({ signal }) => client.request(GetUserDocument, { id }, { signal }),
});
```

```ts title="SWR"
useSWR(['user', id], ([, id]) => client.request(GetUserDocument, { id }));
```

```ts title="Plain async"
const data = await client.request(GetUserDocument, { id });
store.setUser(data.user);
```

## Logging request bodies (with redaction)

```ts
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url,
  auth,
  fetch: async (input, init) => {
    const body = init?.body?.toString().replace(/"da2-[^"]+"/g, '"<redacted>"');
    console.log('[appsync]', input.toString(), body);
    return fetch(input, init);
  },
});
```
