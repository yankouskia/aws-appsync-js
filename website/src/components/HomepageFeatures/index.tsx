import type { ReactNode } from 'react';

type Feature = {
  glyph: string;
  title: string;
  body: ReactNode;
};

const FEATURES: Feature[] = [
  {
    glyph: 'TS',
    title: 'End-to-end TypeScript inference',
    body: (
      <>
        Pass a <code>TypedDocumentNode</code> and the client infers both the response and the
        variables. One source of truth, zero hand-written response types.
      </>
    ),
  },
  {
    glyph: '⚡',
    title: 'Built on native fetch',
    body: (
      <>
        Works on Node ≥ 18, modern browsers, Cloudflare Workers, Vercel Edge, Deno, and Bun. No
        polyfills. Tree-shakable ESM with a proper CJS fallback.
      </>
    ),
  },
  {
    glyph: '🔐',
    title: 'Every AppSync auth mode',
    body: (
      <>
        <code>API_KEY</code>, <code>AWS_IAM</code> (SigV4), <code>AMAZON_COGNITO_USER_POOLS</code>,{' '}
        <code>OPENID_CONNECT</code>, and <code>AWS_LAMBDA</code> — typed as a discriminated union
        so bad combos won&apos;t compile.
      </>
    ),
  },
  {
    glyph: '⏱',
    title: 'AbortSignal · timeouts · retries',
    body: (
      <>
        First-class cancellation. Per-request timeouts. Exponential backoff with jitter that
        defaults to retrying network errors, 5xx, and 429 — fully overridable.
      </>
    ),
  },
  {
    glyph: '!',
    title: 'Errors you can switch on',
    body: (
      <>
        Stable <code>code</code> fields on every error: <code>AppSyncGraphQLError</code>,{' '}
        <code>AppSyncHttpError</code>, <code>AppSyncNetworkError</code>,{' '}
        <code>AppSyncAbortError</code>. No more stringly-typed catches.
      </>
    ),
  },
  {
    glyph: '0',
    title: 'Zero runtime dependencies',
    body: (
      <>
        Nothing follows you into <code>node_modules</code>. SigV4 implemented with{' '}
        <code>node:crypto</code> (or browser <code>SubtleCrypto</code>). Audit it in 15 minutes.
      </>
    ),
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="aas-section">
      <div className="aas-section__inner">
        <h2 className="aas-section__title">A thin, opinionated middle.</h2>
        <p className="aas-section__lead">
          Sits between hand-rolled <code>fetch</code> + SigV4 plumbing and the 200&nbsp;KB
          all-batteries SDK. Optimised for teams that already have a state layer
          (TanStack Query, SWR, your own store) and just want a typed, correct AppSync transport.
        </p>
        <div className="aas-features">
          {FEATURES.map((f) => (
            <div className="aas-feature" key={f.title}>
              <div className="aas-feature__icon">{f.glyph}</div>
              <div className="aas-feature__title">{f.title}</div>
              <div className="aas-feature__body">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
