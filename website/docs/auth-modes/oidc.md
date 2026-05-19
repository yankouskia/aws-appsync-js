---
id: oidc
title: OPENID_CONNECT
sidebar_position: 4
description: Use Auth0, Okta, Keycloak, or any OpenID Connect provider with AppSync.
---

# OpenID Connect

Same shape as [Cognito](/docs/auth-modes/cognito), different IdP. Use this when your authentication lives in Auth0, Okta, Keycloak, Firebase Auth, or any OpenID-Connect-compliant provider that AppSync is configured to trust.

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'oidc',
    jwtToken: async () => (await auth0.getAccessTokenSilently()),
  },
});
```

## What AppSync checks

When the API is configured for OIDC, AppSync validates:

- The JWT signature against the IdP's JWKS endpoint (cached internally).
- `iss` matches the configured issuer URL.
- `aud` matches the configured client ID(s), if set.
- `exp` hasn't passed.

Beyond that, `@auth(rules: …)` directives on your schema decide per-field access.

## Which token?

Whichever token AppSync's OIDC config is set to accept — usually the **ID token**, sometimes the access token if your IdP issues JWT access tokens (Auth0 does this when an `audience` is configured).

## Refresh & rotation

Same recipe as Cognito: pass a function. The client calls it per request, so you can lean on your IdP SDK's silent-refresh hooks:

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'oidc',
    jwtToken: () => keycloak.updateToken(30).then(() => keycloak.token!),
  },
});
```

## When AppSync rejects your token

| Symptom                                       | Cause                                                  |
| --------------------------------------------- | ------------------------------------------------------ |
| 401 with `Unauthorized`                       | Expired / wrong `iss` / wrong `aud`                    |
| 401 with `MalformedJwt`                       | Not a JWT, or signed with an algorithm AppSync doesn't accept (e.g. HS256 for AWS-issued tokens — use RS256) |
| 200 with `errors: [{ errorType: 'Unauthorized' }]` | JWT valid but schema-level `@auth` denies         |

Catch with `AppSyncHttpError` / `AppSyncGraphQLError` respectively — see [Error handling](/docs/error-handling).
