// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { remarkReadingTime } from './src/lib/reading-time.mjs';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://runarca.xyz',
  base: '/blog',
  integrations: [mdx(), sitemap()],
  output: 'static',

  markdown: {
    remarkPlugins: [remarkReadingTime],
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

  adapter: cloudflare()
});