import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

function K({ children }: { children: ReactNode }) {
  return <span className="tok-keyword">{children}</span>;
}
function S({ children }: { children: ReactNode }) {
  return <span className="tok-string">{children}</span>;
}
function F({ children }: { children: ReactNode }) {
  return <span className="tok-fn">{children}</span>;
}
function P({ children }: { children: ReactNode }) {
  return <span className="tok-prop">{children}</span>;
}
function C({ children }: { children: ReactNode }) {
  return <span className="tok-comment">{children}</span>;
}
function T({ children }: { children: ReactNode }) {
  return <span className="tok-type">{children}</span>;
}

function HeroTerminal(): ReactNode {
  return (
    <div className="aas-hero__terminal" aria-hidden="true">
      <div className="aas-hero__terminal-head">
        <span className="red" />
        <span className="yellow" />
        <span className="green" />
        <span className="title">app.ts — aws-appsync-js</span>
      </div>
      <pre>
        <code>
          <K>import</K> {'{ '}
          <F>AppSyncClient</F>
          {' } '}
          <K>from</K> <S>&apos;aws-appsync-js&apos;</S>;{'\n\n'}
          <K>const</K> client = <K>new</K> <F>AppSyncClient</F>({'({\n  '}
          <P>url</P>: <S>&apos;https://xxx.appsync-api.us-east-1.amazonaws.com/graphql&apos;</S>,
          {'\n  '}
          <P>auth</P>: {'{ '}
          <P>type</P>: <S>&apos;cognito&apos;</S>, <P>jwtToken</P>: getIdToken {'}'},{'\n'}
          {'});'}
          {'\n\n'}
          <C>{'// Fully inferred from your TypedDocumentNode 👇'}</C>
          {'\n'}
          <K>const</K> {'{ user } = '}
          <K>await</K> client.<F>request</F>(GetUserDocument, {'{ '}
          <P>id</P> {'}'});{'\n'}
          <C>
            {'//      ^? '}
            <T>{'{ id: string; name: string; email: string | null }'}</T>
          </C>
        </code>
      </pre>
    </div>
  );
}

function Hero(): ReactNode {
  return (
    <header className="aas-hero">
      <div className="aas-hero__inner">
        <div>
          <span className="aas-hero__eyebrow">
            <span className="dot" />
            v1.0 — TypeScript-first, edge-ready
          </span>
          <h1 className="aas-hero__title">
            The AppSync client that fits in <span className="grad">3&nbsp;KB</span>.
            <br />
            Every auth mode. Zero dependencies.
          </h1>
          <p className="aas-hero__lead">
            A tiny, fully-typed, <code>fetch</code>-based GraphQL client for AWS AppSync — built
            for Node, the browser, Cloudflare Workers, Vercel Edge, Deno, and Bun. End-to-end
            TypeScript inference through <code>TypedDocumentNode</code>, retries that actually
            understand AppSync, and errors you can <code>switch</code> on.
          </p>
          <div className="aas-hero__chips">
            <span className="aas-chip">
              <strong>~3&nbsp;KB</strong> gzipped
            </span>
            <span className="aas-chip">
              <strong>0</strong> runtime deps
            </span>
            <span className="aas-chip">
              <strong>5</strong> auth modes
            </span>
            <span className="aas-chip">
              <strong>97%</strong> coverage · 50 tests
            </span>
            <span className="aas-chip">
              ESM + CJS · <strong>.d.ts</strong>
            </span>
          </div>
          <div className="aas-hero__cta">
            <Link className="aas-btn aas-btn--primary" to="/docs/quickstart">
              Get started → 60 seconds
            </Link>
            <Link className="aas-btn aas-btn--ghost" to="/docs/auth-modes/overview">
              Explore auth modes
            </Link>
            <Link
              className="aas-btn aas-btn--ghost"
              to="https://github.com/yankouskia/aws-appsync-js"
            >
              GitHub ↗
            </Link>
          </div>
        </div>
        <HeroTerminal />
      </div>
    </header>
  );
}

function Stats(): ReactNode {
  const items = [
    { value: '~3 KB', label: 'gzipped, tree-shakable ESM' },
    { value: '0', label: 'runtime dependencies' },
    { value: '5 / 5', label: 'AppSync auth modes' },
    { value: '97%', label: 'line coverage · 50 tests' },
  ];
  return (
    <section className="aas-section aas-section--alt">
      <div className="aas-section__inner">
        <h2 className="aas-section__title">Receipts.</h2>
        <p className="aas-section__lead">
          Not a marketing claim — measured by <code>size-limit</code>, <code>publint</code>,{' '}
          <code>@arethetypeswrong/cli</code>, and Vitest in CI on Node 18 / 20 / 22 across Ubuntu,
          macOS, and Windows.
        </p>
        <div className="aas-stats">
          {items.map((s) => (
            <div className="aas-stat" key={s.label}>
              <div className="aas-stat__value">{s.value}</div>
              <div className="aas-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthModes(): ReactNode {
  return (
    <section className="aas-section">
      <div className="aas-section__inner">
        <h2 className="aas-section__title">Every AppSync auth mode. Same client.</h2>
        <p className="aas-section__lead">
          One discriminated <code>auth</code> field, all five AWS-supported modes — including
          SigV4 written from scratch on <code>node:crypto</code> with zero dependencies. Swap{' '}
          <code>type</code> and TypeScript narrows the rest.
        </p>
        <div className="aas-pills">
          <span className="aas-pill aas-pill--accent">type: &apos;apiKey&apos;</span>
          <span className="aas-pill aas-pill--accent">type: &apos;cognito&apos;</span>
          <span className="aas-pill aas-pill--accent">type: &apos;oidc&apos;</span>
          <span className="aas-pill aas-pill--accent">type: &apos;lambda&apos;</span>
          <span className="aas-pill aas-pill--accent">type: &apos;iam&apos;</span>
        </div>
        <div className="aas-cta">
          <Link className="aas-btn aas-btn--primary" to="/docs/auth-modes/overview">
            Read the auth-mode guide
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A tiny, fully-typed, zero-dependency AWS AppSync client. ~3 KB gzipped, every auth mode, edge-ready. Built for TypeScript."
    >
      <Hero />
      <HomepageFeatures />
      <AuthModes />
      <Stats />
    </Layout>
  );
}
