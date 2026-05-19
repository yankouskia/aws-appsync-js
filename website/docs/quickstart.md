---
id: quickstart
title: Quickstart
sidebar_position: 3
description: From zero to a typed AppSync query in under a minute.
---

# Quickstart

From zero to a typed AppSync query in under a minute.

## 1. Install

```bash
pnpm add aws-appsync-js
```

## 2. Create a client

```ts title="src/appsync.ts"
import { AppSyncClient } from 'aws-appsync-js';

export const client = new AppSyncClient({
  url: process.env.APPSYNC_URL!,
  auth: {
    type: 'apiKey',
    apiKey: process.env.APPSYNC_API_KEY!,
  },
});
```

:::tip Where do I get the URL and API key?
AWS Console → AppSync → your API → **Settings** → **API URL** + **API keys**.
:::

## 3. Send a query

```ts
import { client } from './appsync';

type Event = { id: string; name: string };

const { events } = await client.request<{ events: Event[] }>(`
  query ListEvents { events { id name } }
`);

console.log(events.length);
```

## 4. Mutations with variables

The second generic parameter is the variables shape. TypeScript will refuse to compile if the keys/values don't match.

```ts
const { createEvent } = await client.request<
  { createEvent: { id: string } },
  { input: { name: string } }
>(
  `mutation CreateEvent($input: CreateEventInput!) {
     createEvent(input: $input) { id }
   }`,
  { input: { name: 'Re:Invent' } },
);
```

## 5. (Recommended) Skip the hand-written types

Wire up [`@graphql-codegen`](https://the-guild.dev/graphql/codegen) once and the response **and** variables are inferred from your schema:

```ts
import { GetUserDocument } from './generated/graphql';

const data = await client.request(GetUserDocument, { id: '1' });
//    ^? GetUserQuery       — TypeScript reads it from the .graphql operation.
```

Full setup in [TypeScript & codegen](/docs/typescript).

## 6. Pick the right auth mode

If you're not using API keys in production, switch to one of:

- [**Cognito User Pools**](/docs/auth-modes/cognito) — your users sign in, you forward their JWT.
- [**OIDC**](/docs/auth-modes/oidc) — Auth0, Okta, any OpenID Connect IdP.
- [**Lambda authorizer**](/docs/auth-modes/lambda) — a custom function decides.
- [**AWS IAM (SigV4)**](/docs/auth-modes/iam) — service-to-service requests with IAM credentials.

The [auth-modes overview](/docs/auth-modes/overview) walks through the trade-offs.

## 7. Handle errors

```ts
import {
  AppSyncGraphQLError,
  AppSyncHttpError,
  AppSyncAbortError,
} from 'aws-appsync-js';

try {
  await client.request(query);
} catch (err) {
  if (err instanceof AppSyncGraphQLError) return err.errors;
  if (err instanceof AppSyncHttpError && err.status === 401) return refresh();
  if (err instanceof AppSyncAbortError && err.reason === 'timeout') return null;
  throw err;
}
```

See the full taxonomy in [Error handling](/docs/error-handling).

---

That's the whole package for 90 % of use cases. For the remaining 10 % — partial responses, custom retries, edge runtimes, observability — head to the [Cookbook](/docs/cookbook).
