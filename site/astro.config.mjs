// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages 配置
// 如果仓库名是 'owner/ai'，base 应该是 '/ai/'
// 如果使用用户/组织页面（repository 名是 'username.github.io'），base 应该是 '/'
// 如果使用自定义域名，base 应该是 '/'
const getBasePath = () => {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return '/';

  const [, repoName] = repo.split('/');
  // 如果是用户/组织页面，base 应该是 '/'
  if (repoName.endsWith('.github.io')) return '/';
  // 否则使用仓库名作为 base 路径
  return `/${repoName}/`;
};

const getSiteUrl = () => {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return undefined;

  const [owner] = repo.split('/');
  return `https://${owner}.github.io`;
};

// https://astro.build/config
export default defineConfig({
  site: getSiteUrl(),
  base: getBasePath(),
  output: 'static',
  integrations: [
    react(),
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: { theme: 'github-light' },
      remarkPlugins: [],
      rehypePlugins: [],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
