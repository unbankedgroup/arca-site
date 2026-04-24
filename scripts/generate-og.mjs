#!/usr/bin/env node
// Build-time OG image generator. Reads markdown frontmatter from
// src/content/blog/, renders 1200x630 PNGs via Satori + Resvg, and
// writes them to public/og/{slug}.png so the static build can serve
// them at /blog/og/{slug}.png.

import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactNode } from 'satori-html';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENT_DIR = path.join(ROOT, 'src/content/blog');
const FONT_DIR = path.join(ROOT, 'src/assets/fonts');
const OUT_DIR = path.join(ROOT, 'dist/blog/og');

fs.mkdirSync(OUT_DIR, { recursive: true });

function loadFont(filename) {
	const p = path.join(FONT_DIR, filename);
	try {
		return fs.readFileSync(p);
	} catch {
		return null;
	}
}

const jakartaBold = loadFont('PlusJakartaSans-ExtraBold.ttf');
const jakartaRegular = loadFont('PlusJakartaSans-Regular.ttf');

if (!jakartaBold || !jakartaRegular) {
	console.error('[og] missing Jakarta TTFs in src/assets/fonts/');
	process.exit(1);
}

const fonts = [
	{ name: 'Jakarta', data: jakartaBold, weight: 800, style: 'normal' },
	{ name: 'Jakarta', data: jakartaRegular, weight: 400, style: 'normal' },
];

const COLORS = {
	canvas: '#F4EFE6',
	charcoal: '#151413',
	amber: '#B8743D',
	cloud: '#F0EDE8',
	haze: '#9490A0',
};

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, (c) =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
	);
}

function getCategory(cluster) {
	if (!cluster) return 'Arca Learn';
	const m = String(cluster).match(/^C\d+\s*[—-]\s*(.*)$/);
	return m ? m[1].trim() : String(cluster);
}

// Minimal frontmatter parser — handles `key: value`, quoted strings, and
// a single-level `author:` block we use in our content.
function parseFrontmatter(raw) {
	const m = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!m) return null;
	const body = m[1];
	const data = {};
	const lines = body.split('\n');
	let currentKey = null;
	for (const line of lines) {
		if (/^\s+/.test(line) && currentKey) {
			const sub = line.trim().match(/^([a-zA-Z_]+):\s*(.*)$/);
			if (sub) {
				if (typeof data[currentKey] !== 'object') data[currentKey] = {};
				data[currentKey][sub[1]] = sub[2].replace(/^['"]|['"]$/g, '');
			}
			continue;
		}
		const top = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
		if (top) {
			currentKey = top[1];
			const val = top[2];
			if (val === '' || val === undefined) {
				data[currentKey] = {};
			} else {
				data[currentKey] = val.replace(/^['"]|['"]$/g, '');
			}
		}
	}
	return data;
}

async function renderPost(slug, data) {
	const title = data.title || 'Arca';
	const category = getCategory(data.cluster);
	const author = (typeof data.author === 'object' && data.author?.name) || data.author || 'Arca';

	const markup = toReactNode(`
		<div style="display:flex;flex-direction:column;width:100%;height:100%;background:${COLORS.canvas};padding:80px 90px;font-family:'Jakarta',sans-serif;position:relative;">
			<div style="display:flex;align-items:center;gap:14px;">
				<div style="width:42px;height:42px;border-radius:10px;background:${COLORS.charcoal};display:flex;align-items:center;justify-content:center;color:${COLORS.canvas};font-weight:800;font-size:22px;">A</div>
				<div style="font-weight:800;font-size:26px;color:${COLORS.charcoal};letter-spacing:-0.02em;">Arca</div>
				<div style="color:${COLORS.haze};font-size:20px;padding-left:10px;">· Learn</div>
			</div>
			<div style="display:flex;margin-top:60px;color:${COLORS.amber};font-weight:800;font-size:20px;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(category)}</div>
			<div style="display:flex;margin-top:22px;font-weight:800;font-size:${title.length > 70 ? 52 : 64}px;color:${COLORS.charcoal};line-height:1.08;letter-spacing:-0.028em;max-width:1040px;">${escapeHtml(title)}</div>
			<div style="display:flex;flex-grow:1;"></div>
			<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid ${COLORS.cloud};padding-top:28px;">
				<div style="display:flex;align-items:center;gap:16px;">
					<div style="width:48px;height:48px;border-radius:999px;background:${COLORS.amber};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;">${escapeHtml(String(author).charAt(0))}</div>
					<div style="display:flex;flex-direction:column;">
						<div style="color:${COLORS.charcoal};font-weight:700;font-size:22px;">${escapeHtml(author)}</div>
						<div style="color:${COLORS.haze};font-size:16px;margin-top:2px;">runarca.xyz</div>
					</div>
				</div>
				<div style="display:flex;color:${COLORS.charcoal};font-weight:700;font-size:18px;background:${COLORS.cloud};padding:12px 22px;border-radius:999px;">Read the guide →</div>
			</div>
		</div>
	`);

	const svg = await satori(markup, { width: 1200, height: 630, fonts });
	const png = new Resvg(svg).render().asPng();
	fs.writeFileSync(path.join(OUT_DIR, `${slug}.png`), png);
}

const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
let count = 0;
for (const file of files) {
	const slug = file.replace(/\.mdx?$/, '');
	const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
	const data = parseFrontmatter(raw);
	if (!data) continue;
	await renderPost(slug, data);
	count++;
}
