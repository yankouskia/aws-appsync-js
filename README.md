<!-- markdownlint-disable MD033 MD041 MD013 -->

<div align="center">

<h1>⚡ aws-appsync-js</h1>

<p>
  <strong>The <a href="https://aws.amazon.com/appsync/">AWS&nbsp;AppSync</a> client that fits in 3&nbsp;KB.</strong><br/>
  Every auth mode. Zero dependencies. End-to-end TypeScript inference.
</p>

<pre><code>pnpm add aws-appsync-js</code></pre>

<p>
  <a href="https://www.npmjs.com/package/aws-appsync-js"><img src="https://img.shields.io/npm/v/aws-appsync-js.svg?label=npm&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/aws-appsync-js"><img src="https://img.shields.io/npm/dm/aws-appsync-js.svg" alt="downloads" /></a>
  <a href="https://github.com/yankouskia/aws-appsync-js/actions/workflows/ci.yml"><img src="https://github.com/yankouskia/aws-appsync-js/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="https://codecov.io/gh/yankouskia/aws-appsync-js"><img src="https://img.shields.io/codecov/c/github/yankouskia/aws-appsync-js" alt="coverage" /></a>
  <a href="https://bundlephobia.com/package/aws-appsync-js"><img src="https://img.shields.io/bundlephobia/minzip/aws-appsync-js?label=gzip" alt="bundle size" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/aws-appsync-js" alt="license MIT" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/types-included-3178C6?logo=typescript&logoColor=white" alt="types included" />
  <img src="https://img.shields.io/badge/deps-0-22c55e" alt="zero runtime deps" />
  <img src="https://img.shields.io/badge/ESM%20%2B%20CJS-✓-0891b2" alt="ESM + CJS" />
  <img src="https://img.shields.io/badge/AppSync%20auth%20modes-5%2F5-6366f1" alt="5/5 AppSync auth modes" />
  <img src="https://img.shields.io/badge/edge--runtime-Workers%20%C2%B7%20Edge%20%C2%B7%20Deno%20%C2%B7%20Bun-ec4899" alt="edge-runtime" />
</p>

<p>
  <a href="https://yankouskia.github.io/aws-appsync-js"><strong>📖 Docs site</strong></a>
  &nbsp;·&nbsp;
  <a href="https://yankouskia.github.io/aws-appsync-js/api/"><strong>API reference</strong></a>
  &nbsp;·&nbsp;
  <a href="#quickstart"><strong>Quickstart</strong></a>
  &nbsp;·&nbsp;
  <a href="#every-appsync-auth-mode"><strong>Auth modes</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/sponsors/yankouskia"><strong>Sponsor</strong></a>
</p>

</div>

---

```ts
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: 'https://xxx.appsync-api.us-east-1.amazonaws.com/graphql',
  auth: { type: 'apiKey', apiKey: 'da2-…' },
});

const { events } = await client.request<{ events: Event[] }>(`
  query { events { id name } }
`);
```

Two lines of setup, one line per query, and the response is typed exactly the way you say it is. The rest of this README is *"and also…"*.

---

## ✨ Why you'll love it

> **The honest pitch:** if you already use TanStack Query / SWR / Zustand and just want a typed, correct AppSync transport — this is the smallest, sharpest tool for the job.

|     |     |
| --- | --- |
| 🪶 **~3 KB gzipped** — measured by `size-limit` in CI on every PR. | 🔐 **Every AppSync auth mode** — API key, Cognito, OIDC, Lambda, IAM (SigV4). |
| 🧬 **TypedDocumentNode** — full inference for response **and** variables. | ⏱ **AbortSignal · timeouts · retries** — exponential backoff with jitter. |
| 🧱 **Discriminated auth config** — bad combos won't compile. | 🌐 **Edge-ready** — Node, browsers, Workers, Vercel Edge, Deno, Bun. |
| 🧨 **Typed error classes** — `instanceof` or stable `code`, your call. | 📦 **ESM + CJS** with proper `.d.ts`, validated by `publint` + `attw`. |

> **What you don't get:** built-in cache / normalization, subscriptions (yet). Both are excellent in `apollo-client` / `urql` / `aws-amplify` if you need them — pair `aws-appsync-js` with one of them, or with TanStack Query / SWR.

---

## 📚 Table of contents

- [Why this exists](#-why-this-exists)
- [Install](#-install)
- [Quickstart](#-quickstart)
- [How it works](#-how-it-works)
- [Every AppSync auth mode](#-every-appsync-auth-mode)
- [TypeScript superpowers](#-typescript-superpowers)
- [Cookbook](#-cookbook)
- [API at a glance](#-api-at-a-glance)
- [Comparison](#-comparison)
- [Compatibility](#-compatibility)
- [Docs site](#-docs-site)
- [Contributing & sponsoring](#-contributing--sponsoring)

---

## 🧭 Why this exists

The AppSync ecosystem has two extremes:

1. **`aws-amplify`** — full SDK, ~200 KB minified, expects you to live inside its world.
2. **Hand-rolled `fetch` + SigV4 + auth-mode plumbing** — three subtle things to get right per service.

`aws-appsync-js` is the missing middle: a 3 KB GraphQL-over-fetch client that **understands AppSync** (every auth mode, retry semantics, error shapes), gives you **real TypeScript** (not `any`-flavoured types), and **doesn't drag in anything else**. Zero runtime dependencies. ESM-first with a proper CJS fallback. Works in Node, edge runtimes (Cloudflare Workers, Vercel Edge), and the browser.

---

## 📦 Install

```sh
pnpm add aws-appsync-js
# or
npm install aws-appsync-js
# or
yarn add aws-appsync-js
# or
bun add aws-appsync-js
```

Optional peer dependencies (only needed for the typed-document workflow):

```sh
pnpm add -D graphql @graphql-typed-document-node/core
```

Runs on **Node ≥ 18.17**, modern browsers (evergreen, Safari 16+), Cloudflare Workers, Vercel Edge, Deno, and Bun.

---

## 🚀 Quickstart

```ts
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({
  url: process.env.APPSYNC_URL!,
  auth: { type: 'apiKey', apiKey: process.env.APPSYNC_API_KEY! },
});

// Query
const { events } = await client.request<{ events: { id: string; name: string }[] }>(`
  query ListEvents { events { id name } }
`);

// Mutation with variables
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

That's the whole API for 90 % of use cases. The rest of this README shows you the 10 %.

---

## 🔎 How it works

```mermaid
flowchart LR
    A[Your app code] -->|request&lt;TData,TVars&gt;| B((AppSyncClient))
    B --> C{auth.type}
    C -->|apiKey| D[x-api-key header]
    C -->|cognito / oidc| E[Authorization: JWT]
    C -->|lambda| F[Authorization: custom token]
    C -->|iam| G[SigV4-sign request]
    D & E & F & G --> H[fetch POST /graphql]
    H --> I[(AppSync endpoint)]
    I -->|2xx + data| J[TData]
    I -->|errors[]| K[AppSyncGraphQLError]
    I -->|non-2xx| L[AppSyncHttpError]
    H -.->|retry on 5xx / 429 / network| H
```

No client-side cache. No normalization. No subscriptions (yet). Just a typed transport.

---

## 🔐 Every AppSync auth mode

AppSync has five. `aws-appsync-js` supports all five. Same client, different `auth` field:

```ts
// 1. API_KEY — public-ish APIs, the easiest to set up
new AppSyncClient({ url, auth: { type: 'apiKey', apiKey: 'da2-…' } });

// 2. AMAZON_COGNITO_USER_POOLS — your users sign in, you forward their JWT
new AppSyncClient({
  url,
  auth: { type: 'cognito', jwtToken: () => session.getIdToken().getJwtToken() },
});

// 3. OPENID_CONNECT — same shape, different IdP (Auth0, Okta, …)
new AppSyncClient({ url, auth: { type: 'oidc', jwtToken: getAccessToken } });

// 4. AWS_LAMBDA — your custom authorizer takes an opaque token
new AppSyncClient({
  url,
  auth: { type: 'lambda', authorizationToken: 'whatever-your-fn-expects' },
});

// 5. AWS_IAM — SigV4-signed requests using IAM credentials
new AppSyncClient({
  url,
  auth: {
    type: 'iam',
    region: 'us-east-1',
    credentials: { accessKeyId, secretAccessKey, sessionToken },
  },
});
```

The token / credential fields can also be **functions** (sync or async) — `aws-appsync-js` calls them per request, so silent token refresh, IMDS lookups, or any custom strategy just works:

```ts
auth: {
  type: 'cognito',
  jwtToken: async () => (await refreshIfExpired()).idToken,
},
```

→ Full guide with trade-offs, pitfalls, and IdP-specific recipes: **[docs site](https://yankouskia.github.io/aws-appsync-js/docs/auth-modes/overview)**.

---

## 🧬 TypeScript superpowers

This is the part most clients get wrong. `aws-appsync-js` solves three classic AppSync-on-TypeScript pain points:

### 1. Type-safe responses without writing types twice

The naïve pattern duplicates your schema across files and the types drift:

```ts
// ❌ The shape exists in your schema. Now it also exists here. Forever.
type GetUserData = { user: { id: string; name: string; email: string | null } };
const { user } = await client.request<GetUserData>(`
  query GetUser($id: ID!) { user(id: $id) { id name email } }
`, { id });
```

With `@graphql-codegen` + `graphql-typed-document-node`, you write the query once and the client infers **both** the response and the variables:

```ts
// ✅ One source of truth. Types come from your schema.
import { GetUserDocument } from './generated/graphql';

const data = await client.request(GetUserDocument, { id: '1' });
//    ^? GetUserQuery       ^? GetUserQueryVariables — TS checks the call site for you
```

Drop a `.ts` import alongside your `.graphql` file and you get end-to-end safety with zero hand-written types. If you change a field, your IDE squiggles every call site immediately.

<details>
<summary>codegen config (paste into <code>codegen.ts</code>)</summary>

```ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://your.appsync.endpoint/graphql',
  documents: 'src/**/*.{ts,graphql}',
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: { useTypeImports: true, dedupeFragments: true },
    },
  },
};
export default config;
```

</details>

### 2. Discriminated auth config — bad combos won't compile

The most common AppSync footgun is *"oh I forgot to set the region for IAM auth"*. The discriminated union catches that at compile time:

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'iam',
    // ❌ Error: Property 'region' is missing in type
    // ❌ Error: Property 'credentials' is missing in type
  },
});
```

Same for swapping fields between modes — TypeScript narrows the auth object on `type` and only the matching keys are valid.

### 3. Typed error classes you can `switch` on

Instead of stringly-typed catches, every error has a stable `code` you can branch on without an `instanceof` chain across module boundaries:

```ts
try {
  await client.request(query);
} catch (err) {
  if (err instanceof AppSyncGraphQLError) {
    // err.errors is GraphQLFormattedError[] — full shape, fully typed
    return err.errors.map(e => e.message);
  }
  if (err instanceof AppSyncHttpError && err.status === 401) {
    return refreshAndRetry();
  }
  if (err instanceof AppSyncAbortError && err.reason === 'timeout') {
    return 'took too long';
  }
  throw err;
}
```

---

## 🧑‍🍳 Cookbook

### Cancel a request

```ts
const controller = new AbortController();
const promise = client.request(query, vars, { signal: controller.signal });
setTimeout(() => controller.abort(), 100);

await promise.catch((err) => {
  if (err.code === 'ABORTED') {
    /* user-cancelled or timed out */
  }
});
```

### Per-call timeout (overrides the client default of 30 s)

```ts
await client.request(query, vars, { timeoutMs: 2_000 });
```

### Configure retries

```ts
const client = new AppSyncClient({
  url,
  auth,
  retry: {
    attempts: 5,
    baseDelayMs: 250,
    maxDelayMs: 8_000,
    // Default retries network errors + 5xx + 429. Add your own:
    shouldRetry: (err, attempt) =>
      err instanceof AppSyncHttpError && err.status === 503 && attempt < 5,
  },
});
```

### Read partial data on GraphQL errors (don't throw)

GraphQL servers can return both `data` and `errors` for partial successes. By default `aws-appsync-js` throws; switch to non-throwing mode when you need the partial payload:

```ts
const { data, errors } = await client.requestRaw(query);
if (errors) reportToSentry(errors);
render(data); // may be partially populated
```

### Custom `fetch` for edge runtimes / tracing

```ts
const client = new AppSyncClient({
  url,
  auth,
  fetch: (input, init) => tracedFetch(input, { ...init, integrity: 'sri-…' }),
});
```

### Get the introspection schema (build-time codegen, GraphiQL, etc.)

```ts
const schema = await client.introspect();
fs.writeFileSync('./schema.json', JSON.stringify(schema));
```

→ More recipes: **[docs site → Cookbook](https://yankouskia.github.io/aws-appsync-js/docs/cookbook)**.

---

## 📘 API at a glance

| Method                                | What it does                                                              |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `new AppSyncClient(opts)`             | Create a client. See [`AppSyncClientOptions`](./src/types.ts).            |
| `client.request(doc, vars?, opts?)`   | Send a query/mutation. Returns `data` (throws on errors).                 |
| `client.requestRaw(doc, vars?, opts?)`| Same, but returns `{ data, errors, extensions }` without throwing.        |
| `client.query(...)` / `mutate(...)`   | Aliases for `request()` — purely stylistic.                               |
| `client.introspect(opts?)`            | Run the standard introspection query, returns the typed schema.           |

Full generated reference: **<https://yankouskia.github.io/aws-appsync-js/api/>**.

---

## ⚖️ Comparison

| Feature                 | `aws-appsync-js` | `aws-amplify`                                        | `apollo-client`           |
| ----------------------- | ---------------- | ---------------------------------------------------- | ------------------------- |
| Bundle size (gzipped)   | **~3 KB**        | ~200 KB                                              | ~40 KB                    |
| Runtime deps            | **0**            | dozens                                               | several                   |
| All 5 AppSync auth modes| ✅                | ✅                                                    | manual                    |
| SigV4 included          | ✅ (Node)         | ✅                                                    | ❌                         |
| TypedDocumentNode       | ✅                | partial                                              | ✅                         |
| AbortSignal / timeouts  | ✅                | ❌                                                    | via link                  |
| Subscriptions           | ❌ (planned)      | ✅                                                    | ✅                         |
| Caching / normalization | ❌ (by design)    | ✅                                                    | ✅                         |

Use `aws-appsync-js` when you want a thin, typed HTTP client for AppSync and you already handle caching/state elsewhere (TanStack Query, SWR, your own store). Use the full SDKs when you want batteries-included client-side cache or subscriptions.

---

## 🧪 Compatibility

| Runtime              | Status |
| -------------------- | ------ |
| Node ≥ 18.17 (LTS)   | ✅      |
| Node 20 / 22 LTS     | ✅      |
| Cloudflare Workers   | ✅ (API_KEY / Cognito / OIDC / Lambda; IAM not supported — workers have no `node:crypto`) |
| Vercel Edge          | ✅ (same caveat as Workers) |
| Deno ≥ 1.40          | ✅ via `npm:` specifier |
| Bun ≥ 1.0            | ✅      |
| Chrome / Safari / Firefox (last 2) | ✅ |
| iOS Safari 16+       | ✅      |

---

## 🌐 Docs site

A full Docusaurus-powered docs site is published to GitHub Pages on every push to `master`:

**<https://yankouskia.github.io/aws-appsync-js>**

It contains:

- **Quickstart** — get to your first typed query in 60 seconds.
- **One page per auth mode** — including pitfalls, error shapes, and refresh recipes.
- **TypeScript & codegen** — the recommended workflow.
- **Cookbook** — retries, timeouts, partial responses, observability, headers.
- **Edge runtimes** — Workers / Edge / Deno / Bun specifics.
- **Migration from v0** — for users of the original 2018-era package.
- **API reference** — full TypeDoc output at [`/api/`](https://yankouskia.github.io/aws-appsync-js/api/).

The site sources live in [`./website`](./website) and are built with Docusaurus 3 (TypeScript-first config, Mermaid support, dark mode, a custom theme).

---

## ❤️ Contributing & sponsoring

PRs welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Security disclosures: [`SECURITY.md`](./SECURITY.md).

If `aws-appsync-js` is saving your team time:

- ⭐ **[Star the repo](https://github.com/yankouskia/aws-appsync-js)** — it's the cheapest way to say thanks and it helps other engineers find the project.
- 💖 **[Sponsor on GitHub](https://github.com/sponsors/yankouskia)** — every dollar funds maintenance, new auth-mode work, and the long-awaited subscription support.
- 🐛 **[Open an issue](https://github.com/yankouskia/aws-appsync-js/issues/new/choose)** — bugs, ideas, "this README is unclear" — all welcome.

---

## 📜 License

[MIT](./LICENSE) © [Aliaksandr Yankouski](https://github.com/yankouskia)

<p align="center">
  Built with care for the AppSync community.<br/>
  <sub>If you ship a side project on top of this, I'd love to see it — tag <a href="https://github.com/yankouskia">@yankouskia</a> or open a discussion.</sub>
</p>
