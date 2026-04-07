// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import rss from '@astrojs/rss';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://runarca.xyz',
	base: '/blog',
	integrations: [mdx(), tailwind(), sitemap()],
	output: 'static',
	build: {
		format: 'file'
	}
});
