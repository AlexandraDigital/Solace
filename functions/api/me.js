// functions/api/me.js
import { getSession, json, corsHeaders } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env.DB);
  if (!session) return json({ authenticated: false }, 200, corsHeaders());
  return json({ authenticated: true, name: session.name, email: session.email }, 200, corsHeaders());
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
