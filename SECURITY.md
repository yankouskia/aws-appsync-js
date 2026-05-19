# Security Policy

## Supported versions

| Version | Status                |
| ------- | --------------------- |
| `1.x`   | ✅ active support      |
| `0.x`   | ❌ deprecated — please upgrade to `1.x` |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Use the private [GitHub Security Advisory](https://github.com/yankouskia/aws-appsync-js/security/advisories/new)
flow to report a vulnerability. We aim to:

* acknowledge new reports within **72 hours**,
* publish a fix and CVE (where appropriate) within **30 days** of confirmation,
* credit the reporter in the release notes unless they ask to remain anonymous.

If GitHub is not an option, you may also email the maintainer directly — see
the `author` field in `package.json` for the address.

## Scope

In scope:

* The published `aws-appsync-js` npm package (any `1.x` release).
* The SigV4 signer (anything that could weaken the signature).
* Anything that could leak credentials or tokens via logs, errors, telemetry,
  etc.

Out of scope:

* Issues in dependencies — please report those upstream first.
* Misconfiguration of an AppSync endpoint (that's an AWS-side concern).
* Browser-platform issues unrelated to this library's code (CORS, mixed content, …).
