import { toString } from 'mdast-util-to-string';
import readingTime from 'reading-time';

/**
 * Remark plugin — injects `readingTime` (minutes, int) into each post's
 * frontmatter so BlogPost.astro can read it without any writer input.
 */
export function remarkReadingTime() {
	return function (tree, { data }) {
		const textOnPage = toString(tree);
		const stats = readingTime(textOnPage);
		data.astro.frontmatter.readingTime = Math.max(1, Math.round(stats.minutes));
		data.astro.frontmatter.readingWords = stats.words;
	};
}
