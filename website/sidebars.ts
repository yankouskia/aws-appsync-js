import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quickstart',
    },
    {
      type: 'doc',
      id: 'install',
      label: 'Install',
    },
    {
      type: 'category',
      label: 'Auth modes',
      link: { type: 'doc', id: 'auth-modes/overview' },
      collapsed: false,
      items: [
        'auth-modes/api-key',
        'auth-modes/cognito',
        'auth-modes/oidc',
        'auth-modes/lambda',
        'auth-modes/iam',
      ],
    },
    {
      type: 'doc',
      id: 'typescript',
      label: 'TypeScript & codegen',
    },
    {
      type: 'doc',
      id: 'cookbook',
      label: 'Cookbook',
    },
    {
      type: 'doc',
      id: 'error-handling',
      label: 'Error handling',
    },
    {
      type: 'doc',
      id: 'edge-runtimes',
      label: 'Edge runtimes',
    },
    {
      type: 'doc',
      id: 'comparison',
      label: 'Comparison',
    },
    {
      type: 'doc',
      id: 'migration',
      label: 'Migrating from v0',
    },
    {
      type: 'doc',
      id: 'faq',
      label: 'FAQ',
    },
    {
      type: 'link',
      label: 'API reference ↗',
      href: 'pathname:///api/',
    },
  ],
};

export default sidebars;
