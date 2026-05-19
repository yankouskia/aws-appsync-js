import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const ORG = 'yankouskia';
const REPO = 'aws-appsync-js';

const config: Config = {
  title: 'aws-appsync-js',
  tagline: 'A tiny, fully-typed, zero-dependency AWS AppSync client. 3 KB, every auth mode, edge-ready.',
  favicon: 'img/favicon.svg',

  url: `https://${ORG}.github.io`,
  baseUrl: `/${REPO}/`,

  organizationName: ORG,
  projectName: REPO,
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: `https://github.com/${ORG}/${REPO}/edit/master/website/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    metadata: [
      { name: 'keywords', content: 'aws, appsync, graphql, typescript, fetch, sigv4, cognito, oidc, iam, edge, cloudflare workers, vercel edge, deno, bun' },
      { name: 'description', content: 'A tiny, fully-typed, zero-dependency AWS AppSync GraphQL client. ~3 KB gzipped. Every auth mode. Edge-ready. TypedDocumentNode out of the box.' },
    ],
    navbar: {
      title: 'aws-appsync-js',
      logo: {
        alt: 'aws-appsync-js',
        src: 'img/logo.svg',
        srcDark: 'img/logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          to: '/docs/intro',
          label: 'Docs',
          position: 'left',
        },
        {
          to: '/docs/quickstart',
          label: 'Quickstart',
          position: 'left',
        },
        {
          to: '/docs/auth-modes/overview',
          label: 'Auth modes',
          position: 'left',
        },
        {
          to: '/docs/cookbook',
          label: 'Cookbook',
          position: 'left',
        },
        {
          href: 'pathname:///api/',
          label: 'API reference',
          position: 'left',
        },
        {
          href: 'https://www.npmjs.com/package/aws-appsync-js',
          label: 'npm',
          position: 'right',
        },
        {
          href: `https://github.com/${ORG}/${REPO}`,
          'aria-label': 'GitHub repository',
          className: 'header-github-link',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Quickstart', to: '/docs/quickstart' },
            { label: 'Auth modes', to: '/docs/auth-modes/overview' },
            { label: 'TypeScript', to: '/docs/typescript' },
            { label: 'Cookbook', to: '/docs/cookbook' },
            { label: 'Error handling', to: '/docs/error-handling' },
          ],
        },
        {
          title: 'Reference',
          items: [
            { label: 'API reference', href: 'pathname:///api/' },
            { label: 'Comparison', to: '/docs/comparison' },
            { label: 'Edge runtimes', to: '/docs/edge-runtimes' },
            { label: 'Migration from v0', to: '/docs/migration' },
            { label: 'FAQ', to: '/docs/faq' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: `https://github.com/${ORG}/${REPO}` },
            { label: 'Issues', href: `https://github.com/${ORG}/${REPO}/issues` },
            { label: 'Discussions', href: `https://github.com/${ORG}/${REPO}/discussions` },
            { label: 'Sponsor', href: `https://github.com/sponsors/${ORG}` },
            { label: 'npm', href: 'https://www.npmjs.com/package/aws-appsync-js' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Aliaksandr Yankouski. MIT-licensed. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash', 'json', 'graphql', 'diff', 'yaml', 'toml'],
      defaultLanguage: 'typescript',
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: { start: 'highlight-start', end: 'highlight-end' },
        },
        {
          className: 'code-block-error-line',
          line: 'This will error',
        },
      ],
    },
    algolia: undefined,
    announcementBar: {
      id: 'v1-released',
      content:
        '🎉 <b>v1.0</b> is out — full TypeScript rewrite with every AppSync auth mode. <a href="/aws-appsync-js/docs/migration">See the migration guide →</a>',
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
      isCloseable: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
    mermaid: {
      theme: { light: 'neutral', dark: 'dark' },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
