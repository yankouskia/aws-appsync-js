---
id: lambda
title: AWS_LAMBDA
sidebar_position: 5
description: Custom authorizer Lambda — you send an opaque token, your function decides.
---

# Lambda authorizer

Your AppSync API is configured with a custom authorizer Lambda. Whatever token your function expects, you send it in the `Authorization` header. The client doesn't care what's inside — it just forwards it.

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'lambda',
    authorizationToken: 'whatever-your-fn-expects',
  },
});
```

Like Cognito and OIDC, `authorizationToken` can be a function:

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'lambda',
    authorizationToken: async () => {
      const cred = await fetchPartnerCredential();
      return `partner-${cred.id}-${cred.signature}`;
    },
  },
});
```

## When to use it

- **Custom token formats** — your token isn't a JWT, or you need to embed metadata AppSync can't parse natively.
- **Federated / partner auth** — partners issue their own credentials that you swap for AppSync access.
- **Step-up auth** — your function looks up risk signals and decides per request.

## Resolver context

Your authorizer Lambda returns `{ isAuthorized, resolverContext, deniedFields }`. AppSync passes `resolverContext` to your resolvers as `$ctx.identity.resolverContext`, so you can encode whatever identity model fits.

This is purely a server-side concern — the client doesn't see it.

## Caching

AppSync can cache authorizer responses to avoid invoking your Lambda on every request. That's configured on the AppSync side (in the authorizer settings) — there's no client-side knob.

## Errors

| Status / shape                                    | Meaning                                                   |
| ------------------------------------------------- | --------------------------------------------------------- |
| 401                                               | Your authorizer returned `isAuthorized: false`            |
| 500                                               | Your authorizer threw or timed out                        |
| 200 with GraphQL errors about denied fields       | Your authorizer returned `deniedFields: [...]`            |
