// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remarkReadingTime } from './src/lib/reading-time.mjs';
import { remarkFaqSchema } from './src/lib/faq-schema.mjs';

import cloudflare from '@astrojs/cloudflare';

// Sitemap URL dedupe across serialize calls (the sitemap integration calls
// serialize per-item, so we need a set at module scope to catch collisions
// after our /blog/blog/ → /blog/ rewrite merges two distinct routes).
const SITEMAP_SEEN = new Set();

// https://astro.build/config
export default defineConfig({
  site: 'https://runarca.xyz',
  base: '/blog',
  integrations: [
    mdx(),
    sitemap({
      // Astro doubles `/blog/` in sitemap URLs because `base: '/blog'` is
      // applied on top of routes that already live under src/pages/blog/.
      // The real deployed URLs are /blog/<slug>, not /blog/blog/<slug>.
      // Strip the extra segment, drop utility pages from the public sitemap,
      // and dedupe URLs that collide after the fix-up.
      serialize(item) {
        // Drop utility / system pages from the public sitemap
        if (
          item.url.endsWith('/blog/404') ||
          item.url.endsWith('/blog/404/') ||
          item.url.endsWith('/blog/about') ||
          item.url.endsWith('/blog/about/') ||
          item.url.endsWith('/blog/privacy') ||
          item.url.endsWith('/blog/privacy/') ||
          item.url.endsWith('/blog/terms') ||
          item.url.endsWith('/blog/terms/') ||
          item.url.endsWith('/blog/preview') ||
          item.url.endsWith('/blog/preview/')
        ) {
          return undefined;
        }
        // Fix the doubled /blog/blog/ prefix (Astro applies `base: '/blog'`
        // on top of routes that already live under src/pages/blog/)
        item.url = item.url.replace('/blog/blog/', '/blog/');
        if (item.url.endsWith('/blog/blog')) {
          item.url = item.url.replace('/blog/blog', '/blog');
        }
        // Normalize trailing slashes to match the canonical form (no slash)
        if (item.url.length > 'https://runarca.xyz/'.length && item.url.endsWith('/')) {
          item.url = item.url.slice(0, -1);
        }
        // Rewrite /blog/vacation-test → /vacation-test (page lives at root, not under /blog/)
        if (item.url.includes('/blog/vacation-test')) {
          item.url = item.url.replace('/blog/vacation-test', '/vacation-test');
        }
        // Rewrite /blog/strategy → /strategy (page lives at root, not under /blog/)
        if (item.url.includes('/blog/strategy')) {
          item.url = item.url.replace('/blog/strategy', '/strategy');
        }
        // Rewrite /blog/preview → /preview (page lives at root, not under /blog/)
        if (item.url.includes('/blog/preview')) {
          item.url = item.url.replace('/blog/preview', '/preview');
        }
        // Dedupe (site root and blog index both land on /blog after fix-up)
        if (SITEMAP_SEEN.has(item.url)) return undefined;
        SITEMAP_SEEN.add(item.url);
        return item;
      },
    }),
  ],
  output: 'static',

  markdown: {
    remarkPlugins: [remarkReadingTime, remarkFaqSchema],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaLabel: 'Permalink to this heading',
          },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['heading-anchor-icon'] },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
    ],
  },

  build: {
      format: 'file'
	},

  adapter: cloudflare(),
});