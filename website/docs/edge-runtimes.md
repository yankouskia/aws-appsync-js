---
id: edge-runtimes
title: Edge runtimes
sidebar_position: 8
description: Running aws-appsync-js on Cloudflare Workers, Vercel Edge, Deno, and Bun.
---

# Edge runtimes

`aws-appsync-js` is built on the native `fetch` Web API and avoids Node-only built-ins everywhere it can. Most auth modes work on every modern runtime. The exception is SigV4 (AWS IAM auth), which currently relies on `node:crypto`.

## Compatibility matrix

| Runtime              | `apiKey` | `cognito` / `oidc` / `lambda` | `iam` (SigV4) |
| -------------------- | :------: | :---------------------------: | :-----------: |
| Node ≥ 18.17         | ✅       | ✅                            | ✅            |
| Cloudflare Workers   | ✅       | ✅                            | ⚠️ Node-only currently |
| Vercel Edge          | ✅       | ✅                            | ⚠️ Node-only currently |
| Deno ≥ 1.40          | ✅       | ✅                            | ✅            |
| Bun ≥ 1.0            | ✅       | ✅                            | ✅            |
| Browsers (modern)    | ✅       | ✅                            | ⚠️ Don't ship IAM creds to the browser |

## Cloudflare Workers

```ts title="worker.ts"
import { AppSyncClient } from 'aws-appsync-js';

export default {
  async fetch(req, env): Promise<Response> {
    const client = new AppSyncClient({
      url: env.APPSYNC_URL,
      auth: { type: 'apiKey', apiKey: env.APPSYNC_API_KEY },
    });

    const data = await client.request(`query { health { status } }`);
    return Response.json(data);
  },
};
```

```toml title="wrangler.toml"
[vars]
APPSYNC_URL = "https://xxx.appsync-api.us-east-1.amazonaws.com/graphql"
# APPSYNC_API_KEY set via `wrangler secret put APPSYNC_API_KEY`
```

If you need IAM-signed requests from a Worker today, sign on a Node origin and proxy through the Worker. Native edge-SigV4 (using `SubtleCrypto`) is on the roadmap.

## Vercel Edge

```ts title="app/api/events/route.ts"
import { AppSyncClient } from 'aws-appsync-js';

export const runtime = 'edge';

const client = new AppSyncClient({
  url: process.env.APPSYNC_URL!,
  auth: {
    type: 'cognito',
    jwtToken: async () => /* read from cookie / Authorization header */ '',
  },
});

export async function GET() {
  const data = await client.request(`query { events { id } }`);
  return Response.json(data);
}
```

Same SigV4 caveat as Cloudflare Workers.

## Deno

```ts
import { AppSyncClient } from 'npm:aws-appsync-js@^1';

const client = new AppSyncClient({
  url: Deno.env.get('APPSYNC_URL')!,
  auth: { type: 'apiKey', apiKey: Deno.env.get('APPSYNC_API_KEY')! },
});

console.log(await client.request(`query { health { status } }`));
```

Deno's `node:crypto` shim is good enough for SigV4 — IAM auth works.

## Bun

Bun has both native `fetch` and a working `node:crypto`, so everything Just Works:

```ts
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: process.env.APPSYNC_URL!,
  auth: { type: 'iam', region: 'us-east-1', credentials: getCreds },
});
```

## Polyfilling `fetch`

If you're on a runtime that doesn't expose `fetch` globally — extremely rare in 2026 — inject one:

```ts
import { fetch as undiciFetch } from 'undici';

const client = new AppSyncClient({ url, auth, fetch: undiciFetch });
```

The `fetch` parameter is typed loosely (`(input, init) => Promise<Response>`) so most polyfills drop in.
