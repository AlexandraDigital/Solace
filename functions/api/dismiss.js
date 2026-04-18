// functions/api/dismiss.js
import { getSession, json, corsHeaders } from './_auth.js';

export async function onRequestPost({ request, env }) {
  const session = await getSession(request, env.DB);
  if (!session) return json({ error: 'Unauthorised' }, 401);

  const { question_id } = await request.json();
  if (!question_id) return json({ error: 'Missing question_id' }, 400);

  await env.DB.prepare(
    "UPDATE questions SET status = 'dismissed' WHERE id = ?"
  ).bind(question_id).run();

  return json({ ok: true }, 200, corsHeaders());
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
