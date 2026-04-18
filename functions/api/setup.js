// functions/api/setup.js
// ONE-TIME endpoint to create the first advisor account.
// It disables itself once any advisor exists.
// Hit it with: POST /api/setup  { "name": "...", "email": "...", "password": "..." }
import { hashPassword, json } from './_auth.js';

export async function onRequestPost({ request, env }) {
  const existing = await env.DB.prepare('SELECT COUNT(*) as n FROM advisors').first();
  if (existing.n > 0) {
    return json({ error: 'Setup already complete. This endpoint is disabled.' }, 403);
  }

  const { name, email, password } = await request.json();
  if (!name || !email || !password || password.length < 8) {
    return json({ error: 'name, email and password (min 8 chars) required' }, 400);
  }

  const hash = await hashPassword(password);
  await env.DB.prepare(
    'INSERT INTO advisors (name, email, password_hash) VALUES (?, ?, ?)'
  ).bind(name, email.toLowerCase().trim(), hash).run();

  return json({ ok: true, message: 'Advisor account created. This endpoint is now disabled.' });
}
