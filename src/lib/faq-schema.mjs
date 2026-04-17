import { toString } from 'mdast-util-to-string';

/**
 * Remark plugin — scans the post for an "FAQ" H2 section and extracts Q&A
 * pairs into `frontmatter.faqs`. BlogPost.astro emits those as FAQPage
 * JSON-LD, which is what unlocks FAQ rich results in Google SERPs.
 *
 * Author side: write a normal H2 ("FAQ" or "Frequently asked questions").
 * Q&A below can be either:
 *   (a) H3 question + following paragraphs as the answer
 *   (b) "**Q: ...**" paragraph followed by an "A: ..." paragraph
 * Both shapes are detected — mix and match freely, no frontmatter needed.
 */
const FAQ_HEADINGS = /^(faq|faqs|frequently asked questions)\.?$/i;
const Q_PREFIX = /^Q[:.]?\s*/i;
const A_PREFIX = /^A[:.]?\s*/i;

export function remarkFaqSchema() {
	return function (tree, { data }) {
		const nodes = tree.children || [];
		let i = 0;
		while (i < nodes.length) {
			const node = nodes[i];
			if (node.type === 'heading' && node.depth === 2 && FAQ_HEADINGS.test(toString(node).trim())) {
				const faqs = [];
				let j = i + 1;
				while (j < nodes.length) {
					const n = nodes[j];
					// Stop at the next H2 — end of FAQ section.
					if (n.type === 'heading' && n.depth === 2) break;

					// Shape (a): H3 question + following paragraphs/lists.
					if (n.type === 'heading' && n.depth === 3) {
						const question = toString(n).trim();
						const answerParts = [];
						let k = j + 1;
						while (k < nodes.length) {
							const m = nodes[k];
							if (m.type === 'heading' && (m.depth === 2 || m.depth === 3)) break;
							if (m.type === 'thematicBreak') break;
							if (m.type === 'paragraph' || m.type === 'list') {
								answerParts.push(toString(m).trim());
							}
							k++;
						}
						const answer = answerParts.join(' ').replace(/\s+/g, ' ').trim();
						if (question && answer) faqs.push({ question, answer });
						j = k;
						continue;
					}

					// Shape (b): "**Q: ...**" paragraph as question. Two sub-cases:
					//   (b1) Q and A share one paragraph, separated by a newline:
					//        **Q: ...?**\nA: ...
					//   (b2) Q is its own paragraph, A is the next paragraph(s).
					if (n.type === 'paragraph') {
						const text = toString(n).trim();
						if (Q_PREFIX.test(text)) {
							// Strip leading "Q:" then look for an inline "A:" split.
							const rest = text.replace(Q_PREFIX, '');
							const inlineSplit = rest.match(/^([\s\S]+?)\s+A[:.]\s+([\s\S]+)$/i);
							if (inlineSplit) {
								const question = inlineSplit[1].trim();
								const answer = inlineSplit[2].replace(/\s+/g, ' ').trim();
								if (question && answer) faqs.push({ question, answer });
								j += 1;
								continue;
							}
							// Q stands alone — collect following paragraphs as the answer.
							const question = rest.trim();
							const answerParts = [];
							let k = j + 1;
							while (k < nodes.length) {
								const m = nodes[k];
								if (m.type === 'heading' && (m.depth === 2 || m.depth === 3)) break;
								if (m.type === 'thematicBreak') break;
								if (m.type === 'paragraph' && Q_PREFIX.test(toString(m).trim())) break;
								if (m.type === 'paragraph' || m.type === 'list') {
									answerParts.push(toString(m).trim().replace(A_PREFIX, ''));
								}
								k++;
							}
							const answer = answerParts.join(' ').replace(/\s+/g, ' ').trim();
							if (question && answer) faqs.push({ question, answer });
							j = k;
							continue;
						}
					}
					j++;
				}
				if (faqs.length > 0) data.astro.frontmatter.faqs = faqs;
				break;
			}
			i++;
		}
	};
}
