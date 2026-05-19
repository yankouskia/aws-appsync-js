---
id: iam
title: AWS_IAM (SigV4)
sidebar_position: 6
description: Service-to-service AppSync requests signed with AWS IAM credentials. SigV4 implemented with zero dependencies.
---

# AWS IAM (SigV4)

For service-to-service requests from inside your AWS environment. The client signs each request using your IAM credentials via the standard [AWS SigV4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) algorithm.

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'iam',
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN, // when assumed-role
    },
  },
});
```

## Where the credentials come from

In a Lambda function or ECS task, AWS injects credentials into env vars. In EC2, use the instance metadata service. From your laptop, the standard `~/.aws/credentials` profile works once you've called `aws sso login` (or equivalent).

If you need to refresh credentials (e.g. STS assume-role), pass a **function** instead:

```ts
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const provider = fromTemporaryCredentials({
  params: { RoleArn: 'arn:aws:iam::…:role/AppSyncReader' },
});

new AppSyncClient({
  url,
  auth: {
    type: 'iam',
    region: 'us-east-1',
    credentials: () => provider(), // called per request — provider caches internally
  },
});
```

:::tip Yes, this brings in `@aws-sdk/credential-providers`
That's fine — it's a peer-of-your-app dependency, not of `aws-appsync-js`. The library itself stays zero-dep; you pull in just the credential provider you actually use.
:::

## What SigV4 covers

The signature covers:

- HTTP method (`POST`)
- The URL path and (canonicalized) query
- All headers prefixed `host`, `x-amz-…`, `content-type`
- A SHA-256 of the request body

If anything in the canonical request differs by even a byte from what AppSync re-computes, you get a 403. `aws-appsync-js` follows the AWS SigV4 test vectors and is exercised by ~50 tests covering credential variations.

## Runtime notes

- **Node**: uses `node:crypto` for HMAC-SHA256. Zero external deps.
- **Browsers**: not generally useful — you'd be embedding IAM credentials in a browser, which is a security antipattern.
- **Cloudflare Workers / Vercel Edge**: see the caveat in [Edge runtimes](/docs/edge-runtimes). Currently Node-only because of how the SigV4 HMAC is implemented; an edge-compatible build (using `SubtleCrypto`) is on the roadmap.

## Common failure modes

| Symptom                                       | Likely cause                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| 403 "The request signature we calculated…"    | Clock skew (> 5 min) or wrong region                                         |
| 403 "User: arn:aws:iam:: … is not authorized" | IAM policy missing `appsync:GraphQL` on the API resource                     |
| 403 right after credential rotation           | The provider returned stale credentials — call the provider's refresh hook   |
| `AppSyncNetworkError` with no status          | Networking issue (e.g. VPC endpoint misconfig) — not auth                    |
