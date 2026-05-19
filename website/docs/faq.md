---
id: faq
title: FAQ
sidebar_position: 11
description: Frequently asked questions about aws-appsync-js — bundle size, subscriptions, retries, observability.
---

# FAQ

### Why ~3 KB? Where's the catch?

The catch is: no built-in cache and no subscriptions (yet). The library is intentionally just a typed transport. If you already have a cache (TanStack Query, SWR, Zustand) you're paying for it once, not twice.

### Does it support subscriptions?

Not yet — AppSync subscriptions are MQTT-over-WebSocket with its own auth ceremony, and getting it right is its own project. Subscription support is on the roadmap. For now, use the [AppSync subscription pattern from the SDK](https://docs.aws.amazon.com/appsync/latest/devguide/aws-appsync-real-time-data.html) or `aws-amplify` for the WS leg while keeping `aws-appsync-js` for queries/mutations.

### Does it work with AWS AppSync Events?

The HTTP request shape is the same as the classic AppSync GraphQL endpoint, so yes — point the client at the Events `https://…/event` URL with the right auth and it works. Events-specific helpers are not in v1.

### Can I use it without TypeScript?

Yes. Plain JS works fine, just write your queries as template literals and you'll get `Promise<unknown>` back. The library's value-add is biggest with TypeScript, but it's not required.

### Why no built-in cache?

GraphQL caches are a research project disguised as a feature. There are excellent ones already (Apollo, Relay, urql, Houdini) that are better than anything a 3 KB client could ship. We picked composition over reinvention.

### How does the retry policy decide what to retry?

By default: network errors, HTTP 5xx, and HTTP 429. GraphQL errors and HTTP 4xx (other than 429) are **not** retried — they're usually deterministic failures (bad input, expired token, denied by `@auth`). Override with `retry.shouldRetry` if your case differs.

### Does it cache the introspection schema?

No — `client.introspect()` always hits the network. Cache it on your side if you want; the response is the full GraphQL introspection JSON, ~tens of KB depending on schema size.

### Can I use it in React Native?

Yes — RN ≥ 0.71 has a working `fetch` and `AbortController`. The AWS IAM mode needs a SigV4 polyfill since `node:crypto` isn't available; for everything else (API key, Cognito, OIDC, Lambda), it just works.

### Is the SigV4 implementation audited?

It's covered by ~50 Vitest tests including the canonical AWS SigV4 test vectors, runs in CI on Node 18 / 20 / 22 across Ubuntu / macOS / Windows, and is scanned by [CodeQL](https://codeql.github.com/) on every push. It's not "audited" in the formal sense — if you need that, fork it and pay an auditor. The source is ~80 lines you can read in a sitting.

### Does it support persisted queries?

Not as a first-class feature, but you can hash documents on your side and send `{ id: hash }` as the GraphQL body via a custom `fetch` wrapper. Open an issue if you'd like first-class support.

### How do I report a security issue?

See [`SECURITY.md`](https://github.com/yankouskia/aws-appsync-js/blob/master/SECURITY.md) in the repo — please **don't** open a public issue for security reports.

### Can I use it commercially?

Yes — it's MIT-licensed. If it's saving your team time, consider [sponsoring](https://github.com/sponsors/yankouskia).
