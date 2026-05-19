---
id: install
title: Install
sidebar_position: 2
description: How to install aws-appsync-js, supported runtimes, optional peer dependencies.
---

# Install

```bash
pnpm add aws-appsync-js
# or
npm install aws-appsync-js
# or
yarn add aws-appsync-js
# or
bun add aws-appsync-js
```

That's it for the core. **No transitive dependencies are installed.**

## Optional peer dependencies

You only need these if you want full `TypedDocumentNode` inference (recommended):

```bash
pnpm add -D graphql @graphql-typed-document-node/core
```

…and a codegen toolchain to produce the typed documents:

```bash
pnpm add -D @graphql-codegen/cli @graphql-codegen/typescript \
            @graphql-codegen/typescript-operations \
            @graphql-codegen/typed-document-node
```

See [TypeScript & codegen](/docs/typescript) for the `codegen.ts` config.

## Supported runtimes

| Runtime                              | Status |
| ------------------------------------ | ------ |
| Node 18.17 LTS                       | ✅      |
| Node 20 / 22 LTS                     | ✅      |
| Cloudflare Workers                   | ✅ (`apiKey` / Cognito / OIDC / Lambda — see [Edge runtimes](/docs/edge-runtimes)) |
| Vercel Edge                          | ✅ (same caveat as Workers) |
| Deno ≥ 1.40                          | ✅ via the `npm:` specifier |
| Bun ≥ 1.0                            | ✅      |
| Chrome / Edge / Firefox (latest two) | ✅      |
| Safari 16+                           | ✅      |

The only hard requirement is **a working global `fetch`** (Node ≥ 18 has one). You can inject a custom `fetch` via `new AppSyncClient({ fetch })` if you need to.

## Module formats

The package ships **both ESM and CJS** with proper `.d.ts` for each, validated in CI by `publint` and `@arethetypeswrong/cli`:

```jsonc
"exports": {
  ".": {
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "require": {
      "types": "./dist/index.d.cts",
      "default": "./dist/index.cjs"
    }
  }
}
```

ESM-first, `sideEffects: false`, fully tree-shakable.

## Verifying the install

```ts
import { AppSyncClient, AUTH_MODE } from 'aws-appsync-js';

console.log(Object.values(AUTH_MODE));
// → [ 'API_KEY', 'AWS_IAM', 'AMAZON_COGNITO_USER_POOLS', 'OPENID_CONNECT', 'AWS_LAMBDA' ]
```
