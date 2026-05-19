# Modernization Plan — `aws-appsync-js` v1.0.0

## What this package does

A tiny, focused HTTP client for **AWS AppSync** (GraphQL-as-a-service). It lets you fire
`query` / `mutation` / `introspection` requests at an AppSync endpoint using any of the
five AppSync authorization modes — `API_KEY`, `AWS_IAM` (SigV4), `AMAZON_COGNITO_USER_POOLS`,
`OPENID_CONNECT`, `AWS_LAMBDA` — without pulling in the whole Apollo / `aws-amplify`
ecosystem. The package targets people who already have a GraphQL pipeline and want
fewer dependencies, smaller bundles, and end-to-end TypeScript types.

## Current state (pre-modernization)

| Aspect             | State                                                             |
| ------------------ | ----------------------------------------------------------------- |
| Language           | ES6 JavaScript, transpiled by Babel 6                             |
| Build              | webpack 3 → UMD `dist/appsync.js`                                 |
| TypeScript         | None                                                              |
| Tests              | **None**                                                          |
| Linter / formatter | None                                                              |
| CI                 | None (just stale Dependabot PRs)                                  |
| Release            | Manual `npm publish`                                              |
| Docs               | Minimal README that's mostly copy-paste from the AWS AppSync page |
| Auth modes         | Only `API_KEY_MODE` works; all others throw                       |
| Public API         | `default` export `AppSyncClient`, named `authMode` enum           |
| Runtime deps       | None                                                              |
| Dev deps           | All abandoned majors (`babel-core@6`, `webpack@3`, `whatwg-fetch`) |
| Node engines       | Unspecified                                                       |
| `package.json`     | `version: 0.0.1`, no `exports`, no `types`, no `engines`           |
| Bundle size        | 4.8 KB minified UMD                                               |

### Risks / quirks found

* The library has been on `0.0.1` on npm since 2018 (per git log). Bumping straight
  to `1.0.0` is appropriate — the public surface is stable and well-known.
* Default export of a class makes ESM/CJS interop awkward (`require('aws-appsync-js').default`).
  v1 will switch to a **named** `AppSyncClient` export and keep a default export aliased
  to it for one major (back-compat shim documented in `BREAKING_CHANGES.md`).
* `authMode` was a string enum; we preserve the same constants and string values.
* The `QueryBulder.js` typo in the filename is fixed.
* No secrets in git history (verified by grep for `AKIA`, `secret`, `password`,
  `token`).

## Target state

* TypeScript 5.x strict-mode source
* Dual ESM + CJS publish with full `.d.ts`, validated by `publint` + `attw`
* All five AppSync auth modes implemented (SigV4 written with `node:crypto`, no deps)
* Generic `request<TData, TVariables>` with full TS inference, plus first-class
  [`TypedDocumentNode`](https://github.com/dotansimha/graphql-typed-document-node)
  support
* `AbortSignal`, timeouts, retries with exponential backoff
* Typed errors (`AppSyncError`, `AppSyncHttpError`, `AppSyncGraphQLError`)
* **Zero runtime dependencies**
* Vitest test suite ≥ 90 % line coverage
* Biome for lint + format (one tool, fast, zero config bikeshedding)
* `tsup` for bundling
* GitHub Actions: `ci.yml` (matrix), `release.yml` (changesets), `docs.yml`, `codeql.yml`
* TypeDoc-generated API site deployed to GitHub Pages
* Conventional commits + Changesets

## Phase checklist

* [x] Phase 0 — Reconnaissance + this plan
* [x] Phase 1 — Foundation (package.json, tsconfig, engines, exports map)
* [x] Phase 2 — Dependencies (zero runtime deps; modern devDeps)
* [x] Phase 3 — Code rewrite to TypeScript
* [x] Phase 4 — Tooling (Biome, tsup, scripts, git hooks)
* [x] Phase 5 — Tests (Vitest, ≥90 % coverage, type tests)
* [x] Phase 6 — CI / release (Actions, Changesets, OIDC publish)
* [x] Phase 7 — Documentation (README rewrite, TypeDoc, Pages)
* [x] Phase 8 — Hygiene (examples, templates, dependabot, size-limit)
* [x] Phase 9 — Final verification

## Risk register

| Risk                                                                  | Mitigation                                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Existing users importing `default` break on upgrade                   | Keep a default re-export of `AppSyncClient` in v1.0; remove in v2.0. Documented in BREAKING.  |
| SigV4 implementation is subtle — easy to miss canonical request edges | Cover with vectors copied from AWS SigV4 examples + a request fixture test                    |
| Native `fetch` only Node 18+                                          | Engines set to `>=18.17` (matches Node 18 LTS + DOM types). Document in README                |
| `npm provenance` requires OIDC from GitHub                            | Use `pnpm publish --provenance` from `release.yml` with `id-token: write` permission          |
| User has not granted me npm/Pages write — must stop at "ready to publish" | The final summary will hand the maintainer the exact commands to run                       |
