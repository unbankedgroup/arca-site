import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema matching our blog structure
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date().optional(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Optional fields for our blog
			slug: z.string().optional(),
			target_keyword: z.string().optional(),
			secondary_keywords: z.array(z.string()).optional(),
			cluster: z.string().optional(),
			id: z.string().optional(),
			search_intent: z.string().optional(),
			word_count: z.string().optional(),
			links_to: z.array(z.string()).optional(),
			author: z.object({
				name: z.string(),
				role: z.string()
			}).optional(),
			canonical_url: z.string().optional(),
			schema_type: z.string().optional(),
		}),
});

export const collections = { blog };
