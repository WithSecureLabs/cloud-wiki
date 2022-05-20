const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Cloud Security Wiki',
  tagline: 'Securing the Cloud, by WithSecure',
  url: 'https://confident-wilson-c4de9b.netlify.app',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'WithsecureLabs', // Usually your GitHub org/user name.
  projectName: 'cloud-wiki', // Usually your repo name.
  themeConfig: {
    defaultMode: 'dark',
    navbar: {
      title: 'Cloud Security Wiki',
      logo: {
        alt: 'WithSecure Logo',
        src: "img/logo-dark.svg",
        srcDark: "img/logo-light.svg"
      },
      items: [
        {
          type: 'doc',
          docId: 'aws/index',
          position: 'left',
          label: 'AWS',
        },
        {
          type: 'doc',
          docId: 'azure/index',
          position: 'left',
          label: 'Azure',
        },
        {
          type: 'doc',
          docId: 'home',
          position: 'left',
          label: 'Saas',
        },
        {
          to: '/contributing',
          label: 'Contributing',
          position: 'right'
        },
        {
          href: 'https://github.com/withsecurelabs/cloud-wiki',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/withsecure',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/withsecurelabs/cloud-wiki',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} F-Secure Consulting. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
          routeBasePath: '/',
          // Please change this to your repo.
          editUrl:
            'https://github.com/FSecureLABS/cloud-wiki/tree/main',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
