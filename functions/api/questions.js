// functions/api/questions.js
import { getSession, json, corsHeaders } from './_auth.js';

// POST /api/questions — public, submit a question
export async function onRequestPost({ request, env }) {
  const { body, topic } = await request.json();
  if (!body || body.trim().length < 5) return json({ error: 'Question too short' }, 400);

  const result = await env.DB.prepare(
    'INSERT INTO questions (body, topic) VALUES (?, ?) RETURNING id'
  ).bind(body.trim(), topic || null).first();

  return json({ ok: true, id: result.id }, 201, corsHeaders());
}

// GET /api/questions — advisor only, list new questions
export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env.DB);
  if (!session) return json({ error: 'Unauthorised' }, 401);

  const status = new URL(request.url).searchParams.get('status') || 'new';
  const rows = await env.DB.prepare(
    `SELECT id, body, topic, status, created_at FROM questions
     WHERE status = ? ORDER BY created_at DESC LIMIT 50`
  ).bind(status).all();

  return json({ questions: rows.results }, 200, corsHeaders());
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
