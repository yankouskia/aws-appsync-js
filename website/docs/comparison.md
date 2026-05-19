---
id: comparison
title: Comparison
sidebar_position: 9
description: aws-appsync-js vs aws-amplify vs Apollo Client vs hand-rolled fetch.
---

# Comparison

Where `aws-appsync-js` fits in the AppSync client landscape.

## Feature matrix

| Feature                       | `aws-appsync-js`     | `aws-amplify`               | `apollo-client`     | Hand-rolled `fetch` |
| ----------------------------- | :------------------: | :-------------------------: | :-----------------: | :-----------------: |
| Bundle size (gzipped)         | **~3 KB**            | ~200 KB                     | ~40 KB              | ~0 KB (you wrote it) |
| Runtime dependencies          | **0**                | dozens                      | several             | 0                   |
| All 5 AppSync auth modes      | ✅                   | ✅                          | manual              | manual              |
| SigV4 included                | ✅ (Node)            | ✅                          | ❌                  | ❌                  |
| TypedDocumentNode             | ✅                   | partial                     | ✅                  | manual              |
| Discriminated auth config     | ✅                   | ❌                          | n/a                 | n/a                 |
| `AbortSignal` / timeouts      | ✅                   | ❌                          | via link            | manual              |
| Typed error classes           | ✅                   | partial                     | ❌                  | manual              |
| Subscriptions (WS / MQTT)     | 🚧 planned           | ✅                          | ✅ (with link)      | manual              |
| Client cache / normalization  | ❌ by design         | ✅                          | ✅                  | manual              |
| Edge-runtime friendly         | ✅                   | partial                     | ✅                  | depends             |

## When to pick each

### `aws-appsync-js`

When you want a thin, typed HTTP transport for AppSync, you already have caching/state covered elsewhere (TanStack Query, SWR, Zustand, Redux Toolkit Query), and you care about bundle size or edge-runtime support.

### `aws-amplify`

When you want batteries-included client-side cache, subscriptions, auth UI helpers, and you don't mind shipping ~200 KB. Best if you're going all-in on the Amplify ecosystem.

### `apollo-client` (or `urql`)

When you want a sophisticated normalized cache and you're willing to wire up AppSync-specific auth (SigV4, API keys, etc.) yourself via links. Strong if you also talk to non-AppSync GraphQL APIs and want one client.

### Hand-rolled `fetch`

When you have very specific requirements no library covers, or you're writing a single one-off integration and don't want a dependency. Be aware that SigV4 is genuinely subtle to get right.

## Migration paths

- **From `aws-amplify`'s GraphQL client** → see [Migrating from v0](/docs/migration); the pattern is similar even though we're a different package.
- **From Apollo with a custom AppSync link** → drop the link, pass your auth config to `new AppSyncClient(...)`, and replace `useQuery` with whatever state library you prefer.

## Bundle-size deep-dive

`aws-appsync-js` is ESM, `sideEffects: false`, and shipped tree-shaken. The numbers are measured by `size-limit` in CI on every PR — you can see the current threshold in the repo's `.size-limit.json`.

The 3 KB number includes everything: every auth mode, retries, AbortSignal composition, the introspection helper, and the error classes. There's no plugin system to "only pay for what you use" — paying for all of it is already cheap.
