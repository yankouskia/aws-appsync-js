---
id: migration
title: Migrating from v0
sidebar_position: 10
description: Migrating from aws-appsync-js v0.x (the 2018-era JavaScript build) to v1.0.0.
---

# Migrating from v0

`aws-appsync-js` v0.x was a tiny ES6 + webpack-3 UMD bundle that only supported one auth mode (`API_KEY`). v1.0.0 is a complete TypeScript rewrite with every auth mode, AbortSignal, retries, and typed errors. The public surface is intentionally close so most migrations are mechanical.

## TL;DR

- **Imports**: change `import AppSyncClient from 'aws-appsync-js'` → `import { AppSyncClient } from 'aws-appsync-js'`.
  (The default export is still aliased for v1 with a `@deprecated` notice — it will be removed in v2.)
- **Auth**: drop the `authMode` enum, use the new discriminated `auth: { type: '…', … }` field.
- **Errors**: catch `AppSyncGraphQLError` / `AppSyncHttpError` etc. instead of inspecting response shapes.

## Side-by-side

### Before — v0.x

```js
import AppSyncClient, { authMode } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: '…',
  region: 'us-east-1',
  auth: {
    type: authMode.API_KEY_MODE,
    apiKey: 'da2-…',
  },
});

client.query(`query { events { id } }`).then((res) => {
  if (res.errors) {
    console.error(res.errors);
    return;
  }
  console.log(res.data.events);
});
```

### After — v1.0

```ts
import { AppSyncClient, AppSyncGraphQLError } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: '…',
  auth: { type: 'apiKey', apiKey: 'da2-…' },
});

try {
  const { events } = await client.request<{ events: { id: string }[] }>(
    `query { events { id } }`,
  );
  console.log(events);
} catch (err) {
  if (err instanceof AppSyncGraphQLError) console.error(err.errors);
  else throw err;
}
```

## Renamed / changed fields

| v0.x                                        | v1.0                                                  |
| ------------------------------------------- | ----------------------------------------------------- |
| `region` on the client                      | Only required for `auth: { type: 'iam', region }`     |
| `auth: { type: authMode.API_KEY_MODE }`     | `auth: { type: 'apiKey' }`                            |
| `auth: { type: authMode.AWS_IAM, credentials }` | `auth: { type: 'iam', region, credentials }`     |
| `auth: { type: authMode.AMAZON_COGNITO_USER_POOLS, jwtToken }` | `auth: { type: 'cognito', jwtToken }` |
| `client.query(...)`                         | `client.query(...)` (alias of `request`) **or** `client.request(...)` |
| Response is `{ data, errors }`              | Response is `data` directly; use `requestRaw` for the envelope |

## New things you get

- **`oidc`** and **`lambda`** auth modes.
- **`AbortSignal`** and per-request timeouts.
- **Retries** with exponential backoff + jitter.
- **`TypedDocumentNode`** inference.
- **Typed error classes** with stable `code` fields.
- **Full ESM + CJS** publish with proper `.d.ts`.
- **Edge-runtime support** (Cloudflare Workers, Vercel Edge, Deno, Bun).

## The deprecation shim

To make the upgrade low-risk, v1 still exports:

- A `default` export aliased to `AppSyncClient`.
- An `authMode` constant aliased to a subset of `AUTH_MODE`.

Both are marked `@deprecated since v1.0.0` and will be removed in **v2.0**. You can upgrade incrementally: deploy v1 with the shims, then change imports at your own pace.

## CommonJS users

The CJS entry is at `./dist/index.cjs` with its own `.d.cts`. Importing the named export works the same way:

```js
const { AppSyncClient } = require('aws-appsync-js');
```

If you're on a bundler that doesn't read the `exports` map, upgrade it — v1 doesn't ship a UMD bundle.
