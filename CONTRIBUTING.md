# Contributing to `aws-appsync-js`

Thanks for your interest! This is a small, focused library — we keep PRs small and focused too.

## Getting set up

Requirements: **Node ≥ 18.17** and **pnpm ≥ 9**.

```sh
git clone https://github.com/yankouskia/aws-appsync-js.git
cd aws-appsync-js
pnpm install
```

`pnpm install` runs `lefthook install` automatically, wiring up the pre-commit
(Biome + tsc) and commit-msg (Conventional Commits) hooks.

## The dev loop

```sh
pnpm typecheck          # tsc --noEmit
pnpm lint               # biome check
pnpm test               # vitest run
pnpm test:watch         # vitest in watch mode
pnpm test:coverage      # vitest run --coverage
pnpm build              # tsup -> dist/index.{js,cjs,d.ts,d.cts}
pnpm validate:package   # publint + are-the-types-wrong
pnpm docs               # build TypeDoc site -> docs/api
pnpm size               # check gzipped bundle size
```

Before pushing: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` — that's exactly
what CI runs.

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) so the changelog
writes itself. Pick the right prefix:

| Prefix      | When                                                  |
| ----------- | ----------------------------------------------------- |
| `feat:`     | New user-visible feature                              |
| `fix:`      | Bug fix                                               |
| `docs:`     | Docs only (README, JSDoc, this file, etc.)            |
| `refactor:` | Code change with no behaviour change                  |
| `test:`     | Adds or fixes tests                                   |
| `ci:`       | Workflow files only                                   |
| `build:`    | Build tooling (tsup, tsconfig, biome, etc.)           |
| `deps:`     | Dependency bumps                                      |
| `chore:`    | Anything else mundane (e.g. README typo too small)    |

For breaking changes append `!` (e.g. `feat!: …`) and include a `BREAKING CHANGE:`
footer with migration notes.

## Changesets — flagging a release

If your PR is user-visible, run:

```sh
pnpm changeset
```

Pick `patch` / `minor` / `major` and write a one-line summary. Commit the generated
file. When your PR is merged, Changesets opens a release PR; merging that publishes
to npm with provenance.

If your PR is internal (CI tweak, doc fix, internal refactor with no public-API
change), no changeset is needed.

## Adding tests

* Unit tests live under `test/*.test.ts` and use Vitest with a tiny fake `fetch`
  helper in `test/_fake-fetch.ts`. Prefer adding to an existing file.
* Type-level tests use `test/types.test-d.ts` with Vitest's `expectTypeOf` and
  `// @ts-expect-error`. Add one whenever you change a public signature.
* Coverage thresholds are enforced in `vitest.config.ts` (lines 90 %, functions 90 %,
  branches 85 %). If a PR drops below, CI fails — add tests or justify the gap in
  the PR description.

## Reporting bugs / asking questions

Open an [issue](https://github.com/yankouskia/aws-appsync-js/issues/new/choose).
For security issues, use the [private advisory flow](https://github.com/yankouskia/aws-appsync-js/security/advisories/new)
instead — see `SECURITY.md`.
