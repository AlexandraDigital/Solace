// functions/api/answer.js
import { getSession, json, corsHeaders } from './_auth.js';

// POST /api/answer  { question_id, body }
export async function onRequestPost({ request, env }) {
  const session = await getSession(request, env.DB);
  if (!session) return json({ error: 'Unauthorised' }, 401);

  const { question_id, body } = await request.json();
  if (!question_id || !body?.trim()) return json({ error: 'Missing fields' }, 400);

  const advisor = await env.DB.prepare(
    'SELECT id FROM advisors WHERE email = ?'
  ).bind(session.email).first();

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO answers (question_id, advisor_id, body) VALUES (?, ?, ?)'
    ).bind(question_id, advisor.id, body.trim()),
    env.DB.prepare(
      "UPDATE questions SET status = 'answered' WHERE id = ?"
    ).bind(question_id),
  ]);

  return json({ ok: true }, 200, corsHeaders());
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
