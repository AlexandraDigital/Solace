// functions/api/login.js
import { verifyPassword, generateSessionId, json, corsHeaders } from './_auth.js';

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json();
  if (!email || !password) return json({ error: 'Missing fields' }, 400);

  const DB = env.DB;

  const advisor = await DB.prepare(
    'SELECT id, name, email, password_hash FROM advisors WHERE email = ?'
  ).bind(email.toLowerCase().trim()).first();

  if (!advisor) return json({ error: 'Invalid email or password' }, 401);

  const valid = await verifyPassword(password, advisor.password_hash);
  if (!valid) return json({ error: 'Invalid email or password' }, 401);

  const sessionId = generateSessionId();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  await DB.prepare(
    'INSERT INTO sessions (id, advisor_id, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, advisor.id, expires).run();

  const cookie = `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;

  return json({ ok: true, name: advisor.name }, 200, {
    'Set-Cookie': cookie,
    ...corsHeaders()
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
