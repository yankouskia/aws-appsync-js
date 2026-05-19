---
id: intro
title: Introduction
sidebar_position: 1
slug: /intro
description: A tiny, fully-typed, zero-dependency AWS AppSync GraphQL client built on fetch.
---

# `aws-appsync-js`

A **tiny, fully-typed, zero-dependency** GraphQL client for [AWS AppSync](https://aws.amazon.com/appsync/).
Plain `fetch` under the hood, end-to-end TypeScript inference on top, **~3&nbsp;KB gzipped**.

```ts title="The whole API, basically"
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: 'https://xxx.appsync-api.us-east-1.amazonaws.com/graphql',
  auth: { type: 'apiKey', apiKey: 'da2-…' },
});

const { events } = await client.request<{ events: Event[] }>(`
  query { events { id name } }
`);
```

Two lines of setup, one line per query, and the response is typed exactly the way you say it is. The rest of these docs are *"and also…"*.

## Why this exists

The AppSync ecosystem has two extremes:

1. **`aws-amplify`** — full SDK, ~200&nbsp;KB minified, expects you to live inside its world.
2. **Hand-rolled `fetch` + SigV4 + auth-mode plumbing** — three subtle things to get right, per service.

`aws-appsync-js` is the missing middle: a tiny GraphQL-over-fetch client that:

- **Understands AppSync** — every auth mode, retry semantics, the JSON error shape AppSync actually uses.
- **Speaks real TypeScript** — not `any`-flavoured types. Discriminated auth unions, `TypedDocumentNode` inference, typed error classes.
- **Doesn't drag in anything else** — **zero** runtime dependencies. SigV4 written from scratch on `node:crypto` / `SubtleCrypto`.
- **Works everywhere** — Node ≥ 18.17, modern browsers, Cloudflare Workers, Vercel Edge, Deno, Bun.

## At a glance

```mermaid
flowchart LR
    A[Your app code] -->|request<TData,TVars>| B((AppSyncClient))
    B --> C{auth.type}
    C -->|apiKey| D[x-api-key header]
    C -->|cognito / oidc| E[Authorization: JWT]
    C -->|lambda| F[Authorization: custom token]
    C -->|iam| G[SigV4-sign request]
    D & E & F & G --> H[fetch POST /graphql]
    H --> I[AppSync endpoint]
    I -->|2xx + data| J[TData]
    I -->|errors[]| K[AppSyncGraphQLError]
    I -->|non-2xx| L[AppSyncHttpError]
    H -.->|retry on 5xx / 429 / network| H
```

## What's inside

| Capability                                   | Status                                                          |
| -------------------------------------------- | --------------------------------------------------------------- |
| All 5 AppSync auth modes                     | ✅                                                              |
| TypedDocumentNode inference                  | ✅                                                              |
| AbortSignal + per-request timeouts           | ✅                                                              |
| Retries with exponential backoff + jitter    | ✅                                                              |
| Typed error classes with stable `code`       | ✅                                                              |
| Introspection helper                         | ✅                                                              |
| Custom `fetch` injection                     | ✅                                                              |
| Subscriptions (WebSocket / MQTT-over-WS)     | 🚧 planned                                                      |
| Client-side cache / normalisation            | ❌ by design — bring your own (TanStack Query, SWR, Zustand, …) |

## Next steps

- [**Quickstart**](/docs/quickstart) — install + first query in 60 seconds.
- [**Auth modes**](/docs/auth-modes/overview) — pick the right one and get it typed correctly.
- [**TypeScript & codegen**](/docs/typescript) — make the compiler write your types for you.
- [**Cookbook**](/docs/cookbook) — timeouts, retries, partial data, observability.
- [**API reference**](pathname:///api/) — full TypeDoc output.
