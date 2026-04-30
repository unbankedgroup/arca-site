import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = "/root/arca/ops/data/preview-requests";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const business_name = body.business_name;
  const email = body.email;

  if (!business_name || typeof business_name !== "string" || !business_name.trim()) {
    return new Response(JSON.stringify({ error: "business_name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return new Response(JSON.stringify({ error: "email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = randomUUID();
  const entry = {
    id,
    timestamp: new Date().toISOString(),
    business_name: business_name.trim(),
    industry: (body.industry as string)?.trim() || null,
    employee_count: body.team_size ?? null,
    pain_points: Array.isArray(body.pain_points) ? body.pain_points : [],
    wish_text: (body.wish as string)?.trim() || null,
    email: email.trim(),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));

  return new Response(JSON.stringify({ ok: true, id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};