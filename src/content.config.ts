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
			// Posts use either 'description' (Astro default) or 'meta_description' (our cluster posts)
			description: z.string().optional(),
			meta_description: z.string().optional(),
			pubDate: z.coerce.date().optional(),
			updatedDate: z.coerce.date().optional(),
			last_updated: z.string().optional(),
			heroImage: z.optional(image()),
			// SEO fields
			slug: z.string().optional(),
			target_keyword: z.string().optional(),
			// Accept both string and array for secondary_keywords
			secondary_keywords: z.union([z.string(), z.array(z.string())]).optional(),
			cluster: z.string().optional(),
			id: z.string().optional(),
			article_id: z.string().optional(),
			search_intent: z.string().optional(),
			word_count: z.union([z.string(), z.number()]).optional(),
			word_count_target: z.string().optional(),
			links_to: z.union([z.string(), z.array(z.string())]).optional(),
			// Accept both string and object for author
			author: z.union([
				z.string(),
				z.object({
					name: z.string(),
					role: z.string().optional()
				})
			]).optional(),
			canonical_url: z.string().optional(),
			schema_type: z.string().optional(),
			date_published: z.union([z.string(), z.coerce.date()]).optional(),
		}),
});

export const collections = { blog };
