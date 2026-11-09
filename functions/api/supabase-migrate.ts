/**
 * POST /api/supabase-migrate
 *
 * Adds the clearance_price column to Supabase products table.
 * Uses SUPABASE_SERVICE_ROLE_KEY from runtime env (Cloudflare Pages secret).
 *
 * Call once after deploy:
 *   curl -X POST https://thrive-ve.com/api/supabase-migrate
 *
 * Or run manually in Supabase SQL editor:
 *   ALTER TABLE products ADD COLUMN IF NOT EXISTS clearance_price REAL;
 */

const SQL = 'ALTER TABLE products ADD COLUMN IF NOT EXISTS clearance_price REAL';

export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
  const serviceKey: string = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase credentials in env' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const ref = (supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/) || [])[1];
  if (!ref) {
    return new Response(JSON.stringify({ error: 'Cannot parse project ref' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // ── Attempt 1: Supabase Management API (requires PAT, works if service key == PAT)
  const managementUrl = `https://api.supabase.com/v1/projects/${ref}/database/query`;
  try {
    const r = await fetch(managementUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SQL }),
    });
    const body = await r.json() as any;
    if (r.ok && !body.error) {
      return new Response(JSON.stringify({ success: true, via: 'management-api' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    console.log('Management API attempt failed:', body.error || body.message);
  } catch (e) {
    console.log('Management API error:', e);
  }

  // ── Attempt 2: project-level pg-meta (Supabase platform internal)
  const pgMetaUrl = `https://${ref}.supabase.co/pg-meta/v1/query`;
  try {
    const r = await fetch(pgMetaUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SQL }),
    });
    const body = await r.json() as any;
    if (r.ok && !body.error) {
      return new Response(JSON.stringify({ success: true, via: 'pg-meta' }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    console.log('pg-meta attempt failed:', body.error || body.message || body);
  } catch (e) {
    console.log('pg-meta error:', e);
  }

  // ── All attempts failed — return SQL for manual execution
  return new Response(JSON.stringify({
    success: false,
    manual_sql: SQL,
    instructions: `Run this in Supabase SQL editor: https://supabase.com/dashboard/project/${ref}/sql/new`,
  }), {
    status: 422,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
