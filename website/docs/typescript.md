---
id: typescript
title: TypeScript & codegen
sidebar_position: 5
description: End-to-end type inference for AppSync queries with TypedDocumentNode + graphql-codegen.
---

# TypeScript & codegen

This is the part most GraphQL clients get wrong. `aws-appsync-js` solves three classic AppSync-on-TypeScript pain points.

## 1. The "types written twice" problem

The naïve pattern duplicates your schema across files and the types drift the moment someone adds a field:

```ts title="❌ The shape exists in your schema. Now it also exists here. Forever."
type GetUserData = {
  user: { id: string; name: string; email: string | null };
};

const { user } = await client.request<GetUserData>(
  `query GetUser($id: ID!) {
     user(id: $id) { id name email }
   }`,
  { id },
);
```

With [`@graphql-codegen`](https://the-guild.dev/graphql/codegen) + [`graphql-typed-document-node`](https://github.com/dotansimha/graphql-typed-document-node), you write the query once and the client infers **both** the response and the variables:

```ts title="✅ One source of truth."
import { GetUserDocument } from './generated/graphql';

const data = await client.request(GetUserDocument, { id: '1' });
//    ^? GetUserQuery       ^? checked against GetUserQueryVariables
```

Change a field in the schema → codegen re-runs → your IDE squiggles every call site immediately.

### `codegen.ts`

```ts title="codegen.ts"
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://your.appsync.endpoint/graphql',
  // ↑ if your auth mode needs headers, use the introspection helper instead;
  //   see "Working offline" below
  documents: 'src/**/*.{ts,graphql}',
  generates: {
    'src/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typed-document-node',
      ],
      config: {
        useTypeImports: true,
        dedupeFragments: true,
        skipTypename: false,
      },
    },
  },
};

export default config;
```

Run it with `pnpm graphql-codegen` (add it to a `prebuild` script). The generated file exports a `TypedDocumentNode<Data, Variables>` per operation.

### Working offline (or behind auth)

If you can't expose your AppSync endpoint to `@graphql-codegen` directly, use the introspection helper to write a schema file once, then point codegen at the file:

```ts title="scripts/introspect.ts"
import { writeFile } from 'node:fs/promises';
import { AppSyncClient } from 'aws-appsync-js';

const client = new AppSyncClient({ url, auth });
const schema = await client.introspect();
await writeFile('schema.json', JSON.stringify(schema, null, 2));
```

```ts title="codegen.ts"
const config: CodegenConfig = {
  schema: './schema.json',
  // … rest unchanged
};
```

## 2. Discriminated auth — bad combos won't compile

The most common AppSync footgun is *"I forgot to set the region for IAM auth"*. The discriminated union catches that at compile time:

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'iam',
    // This will error: Property 'region' is missing in type
    // This will error: Property 'credentials' is missing in type
  },
});
```

Swap fields between modes and TypeScript rejects them too:

```ts
new AppSyncClient({
  url,
  auth: {
    type: 'apiKey',
    apiKey: 'da2-…',
    // This will error: 'jwtToken' does not exist on type ApiKeyAuth
    jwtToken: getToken,
  },
});
```

## 3. Typed error classes you can `switch` on

Every error has a stable `code` you can branch on without an `instanceof` chain across module boundaries:

```ts
import {
  AppSyncGraphQLError,
  AppSyncHttpError,
  AppSyncAbortError,
  AppSyncNetworkError,
} from 'aws-appsync-js';

try {
  await client.request(query);
} catch (err) {
  if (err instanceof AppSyncGraphQLError) {
    return err.errors.map((e) => e.message);
  }
  if (err instanceof AppSyncHttpError && err.status === 401) {
    return refreshAndRetry();
  }
  if (err instanceof AppSyncAbortError) {
    return err.reason === 'timeout' ? 'took too long' : 'cancelled';
  }
  if (err instanceof AppSyncNetworkError) {
    return 'offline';
  }
  throw err;
}
```

See the full taxonomy in [Error handling](/docs/error-handling).

## Strict-mode friendly

The library is written with `strict: true`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. Optional response fields are typed as `T | undefined`, not silently widened. The types you see in IntelliSense are the types you'll get at runtime.
