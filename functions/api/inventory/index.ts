/**
 * Inventory API - Uses Cloudflare D1 Binding
 */

export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;
  const db = env.DB;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: 'D1 binding (DB) not configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // GET - Read inventory
    if (method === 'GET') {
      try {
        const { results } = await db.prepare('SELECT * FROM inventory ORDER BY sku ASC').all();

        return new Response(JSON.stringify({
          success: true,
          data: results,
          count: results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (queryError: any) {
        if (queryError.message.includes('no such table')) {
          return new Response(JSON.stringify({
            success: true,
            data: [],
            count: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw queryError;
      }
    }

    // POST - Update inventory stock
    if (method === 'POST') {
      const body = await request.json() as any;

      if (!body.sku || body.stock_left === undefined) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: sku, stock_left'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const now = new Date().toISOString();

      // Ensure table exists
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS inventory (
          id TEXT PRIMARY KEY,
          sku TEXT NOT NULL UNIQUE,
          item_name TEXT,
          stock_bought INTEGER DEFAULT 0,
          stock_left INTEGER NOT NULL,
          created_at TEXT,
          updated_at TEXT
        )
      `).run();

      // Update or insert
      const sql = `
        INSERT INTO inventory (id, sku, item_name, stock_bought, stock_left, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(sku) DO UPDATE SET
          stock_left = excluded.stock_left,
          updated_at = excluded.updated_at
      `;

      const id = body.id || crypto.randomUUID();

      await db.prepare(sql).bind(
        id,
        body.sku,
        body.item_name || null,
        body.stock_bought || 0,
        body.stock_left,
        now,
        now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id, ...body, updated_at: now }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
