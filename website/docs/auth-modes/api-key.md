---
id: api-key
title: API_KEY
sidebar_position: 2
description: The simplest AppSync auth mode — a static x-api-key header.
---

# API key

The simplest AppSync auth mode. AppSync issues a key (the `da2-…` strings in the console) and you send it in the `x-api-key` header on every request.

```ts
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: 'https://xxx.appsync-api.us-east-1.amazonaws.com/graphql',
  auth: { type: 'apiKey', apiKey: 'da2-abcdefghijklmnopqrstuvwxyz' },
});
```

## When to use it

- Public / semi-public APIs (think: anonymous read endpoints).
- Hackathons, demos, internal tools where you control distribution.
- The "I just want to try AppSync" case.

## When **not** to use it

- Anywhere an end user could extract the key from a bundled JS app — they will.
- Anything where you need per-user authorization (use [Cognito](/docs/auth-modes/cognito) or [OIDC](/docs/auth-modes/oidc) instead).

## What the client does

Adds two headers to every request:

```http
POST /graphql
Content-Type: application/json; charset=UTF-8
x-api-key: da2-abcdefghijklmnopqrstuvwxyz
```

That's it — there's no auto-refresh, no signing, no extra round trips.

## Keys with expiry

AppSync API keys can have an expiry. The client doesn't track expiry; rotate on your side and pass a fresh key when you do. If you want the client to read the latest key per request, store it in a closure:

```ts
let currentKey = process.env.APPSYNC_API_KEY!;

const client = new AppSyncClient({
  url,
  auth: { type: 'apiKey', get apiKey() { return currentKey; } },
});

// Later: rotate
currentKey = await fetchRotatedKey();
```

(Yes, getters work — the auth config is read for every request.)
