# Changesets

This folder is managed by [@changesets/cli](https://github.com/changesets/changesets).

When you make a change worth releasing, run `pnpm changeset` and follow the prompts.
That creates a Markdown file in this folder describing the change. On merge to
`master`, the Changesets GitHub Action opens a release PR; merging it publishes
to npm with provenance.
