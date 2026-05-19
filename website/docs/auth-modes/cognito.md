---
id: cognito
title: AMAZON_COGNITO_USER_POOLS
sidebar_position: 3
description: Forward a Cognito User Pools JWT — usually the right pick for end-user apps.
---

# Cognito User Pools

Your users sign in with Cognito, and you forward their **ID token** (a JWT) to AppSync as the `Authorization` header.

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'cognito',
    jwtToken: () => session.getIdToken().getJwtToken(),
  },
});
```

`jwtToken` is a `string | (() => string | Promise<string>)`. **Prefer the function form** — it's evaluated per request, so silent refresh works without re-instantiating the client.

## Silent refresh

```ts
import { fetchAuthSession } from 'aws-amplify/auth';

const client = new AppSyncClient({
  url,
  auth: {
    type: 'cognito',
    jwtToken: async () => {
      const session = await fetchAuthSession(); // refreshes if expired
      return session.tokens!.idToken!.toString();
    },
  },
});
```

The same pattern works with `amazon-cognito-identity-js`, your own auth library, or whatever you use to hold the session.

## Which token?

AppSync expects the **ID token**, not the access token, when the API is configured for User Pools. The ID token's `aud` matches the User Pool's app client ID, which is what AppSync checks.

## Errors you'll see

| Symptom                                         | Cause                                       | Fix                                                          |
| ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `AppSyncHttpError` with status 401              | Token expired or wrong audience             | Refresh the token; verify the User Pool's app client ID      |
| `AppSyncGraphQLError` with `Unauthorized`       | Token valid but `@auth` rules deny          | Inspect the GraphQL `errors[0].extensions` for the rule name |
| `AppSyncHttpError` with status 403, "Forbidden" | Token signed by a different User Pool       | Point your client at the same pool AppSync is configured for |

See [Error handling](/docs/error-handling) for the full taxonomy.

## Browser apps

This auth mode works in browsers, edge runtimes, and Node — anywhere you can produce a JWT. No SigV4, no `node:crypto` required.
