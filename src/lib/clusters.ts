// Single source of truth for cluster metadata. The frontmatter `cluster`
// field on each post is just the code (C1, C2, …) — these maps turn that
// into the human label and short deck used across the blog index, post
// pages, breadcrumbs, prev/next, and JSON-LD.

export const clusterLabels: Record<string, string> = {
	C1: 'Managed Operations',
	C2: 'Automation for Service Businesses',
	C3: 'Operations & Productivity',
	C4: 'Tool Alternatives & Comparisons',
	C5: 'VAs vs Operations Platforms',
	C6: 'Client Onboarding & Revenue Ops',
};

export const clusterDecks: Record<string, string> = {
	C1: 'What managed operations actually means — and why done-for-you beats DIY for solo operators.',
	C2: 'Automate the boring parts of a service business without turning into a Zapier monster.',
	C3: 'Systems, rituals, and checklists for doing more of the work you actually want to do.',
	C4: "Honest comparisons of the tools solo operators use every day — what works, what doesn't.",
	C5: 'Hiring a VA vs. buying an operations platform. Costs, trade-offs, and when to do which.',
	C6: 'Turning new leads into paying clients without ghosting them in the inbox.',
};

export const clusterOrder = ['C1'];

// Resolve a frontmatter `cluster` value to { code, label }. Accepts either
// a bare code ("C1") or "C1 — Label" form.
export function resolveCluster(cluster?: string): { code: string; label: string } {
	if (!cluster) return { code: '', label: 'Learn' };
	const m = String(cluster).match(/^(C\d+)\s*[—-]\s*(.*)$/);
	if (m) {
		const code = m[1];
		return { code, label: m[2].trim() || clusterLabels[code] || code };
	}
	const codeMatch = String(cluster).match(/^C\d+$/);
	if (codeMatch) {
		const code = codeMatch[0];
		return { code, label: clusterLabels[code] || code };
	}
	return { code: '', label: String(cluster) };
}
