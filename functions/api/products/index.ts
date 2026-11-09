/**
 * Products API - Uses Cloudflare D1 Binding
 */

export async function onRequest(context: any): Promise<Response> {
  const { request, env, params } = context;
  const db = env?.DB;
  const url = new URL(request.url);
  const method = request.method;
  const productId = params?.id as string | undefined;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!db) {
    console.error('❌ D1 binding not available in context:', { hasEnv: !!env, envKeys: env ? Object.keys(env) : [] });
    return new Response(JSON.stringify({
      success: false,
      error: 'D1 binding (DB) not configured in Cloudflare Pages',
      details: 'Please configure D1 binding in Pages project settings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // GET - Read operations
    if (method === 'GET') {
      const category = url.searchParams.get('category');
      const sku = url.searchParams.get('sku');
      const limit = url.searchParams.get('limit');

      let sql = 'SELECT * FROM products';
      const bindParams: any[] = [];
      const conditions: string[] = [];

      if (productId) {
        conditions.push('id = ?');
        bindParams.push(productId);
      }
      if (category) {
        conditions.push('category = ?');
        bindParams.push(category);
      }
      if (sku) {
        conditions.push('sku = ?');
        bindParams.push(sku);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';

      if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }

      try {
        const { results } = await db.prepare(sql).bind(...bindParams).all();

        return new Response(JSON.stringify({
          success: true,
          data: results,
          count: results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (queryError: any) {
        // Handle missing table
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

    // POST - Create product
    if (method === 'POST') {
      const body = await request.json() as any;

      if (!body.name || !body.sku || body.price == null || isNaN(Number(body.price)) || !body.category) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing required fields: name, sku, price, category'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const id = body.id || crypto.randomUUID();
      const now = new Date().toISOString();

      // Ensure table exists
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          status TEXT DEFAULT 'In Store',
          sku TEXT NOT NULL UNIQUE,
          price REAL NOT NULL,
          buy_link TEXT,
          image_url TEXT,
          group_name TEXT,
          color TEXT,
          hex_color TEXT,
          created_at TEXT,
          updated_at TEXT,
          created_by TEXT,
          specifications TEXT,
          variant_order INTEGER,
          secondary_hex_color TEXT,
          secondary_image_url TEXT,
          clearance_price REAL
        )
      `).run();

      // Migrate: add secondary_image_url if it doesn't exist yet
      try {
        await db.prepare('ALTER TABLE products ADD COLUMN secondary_image_url TEXT').run();
      } catch (_) { /* column already exists */ }

      // Migrate: add clearance_price if it doesn't exist yet
      try {
        await db.prepare('ALTER TABLE products ADD COLUMN clearance_price REAL').run();
      } catch (_) { /* column already exists */ }

      const sql = `
        INSERT INTO products (
          id, name, description, category, status, sku, price, buy_link,
          image_url, group_name, color, hex_color, created_at, updated_at,
          created_by, specifications, variant_order, secondary_hex_color,
          secondary_image_url, clearance_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.prepare(sql).bind(
        id, body.name, body.description || null, body.category,
        body.status || 'In Store', body.sku, body.price, body.buy_link || null,
        body.image_url || null, body.group_name || null, body.color || null,
        body.hex_color || null, now, now, body.created_by || null,
        JSON.stringify(body.specifications || {}), body.variant_order || null,
        body.secondary_hex_color || null, body.secondary_image_url || null,
        body.clearance_price ?? null
      ).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id, ...body, created_at: now, updated_at: now }
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT - Update product
    if (method === 'PUT' && productId) {
      const body = await request.json() as any;
      const now = new Date().toISOString();
      const updates: string[] = [];
      const bindParams: any[] = [];

      const fields = [
        'name', 'description', 'category', 'status', 'sku', 'price',
        'buy_link', 'image_url', 'group_name', 'color', 'hex_color',
        'specifications', 'variant_order', 'secondary_hex_color',
        'secondary_image_url', 'clearance_price'
      ];

      fields.forEach(field => {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          bindParams.push(field === 'specifications' ? JSON.stringify(body[field]) : body[field]);
        }
      });

      if (updates.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'No fields to update'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      updates.push('updated_at = ?');
      bindParams.push(now);
      bindParams.push(productId);

      const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      await db.prepare(sql).bind(...bindParams).run();

      return new Response(JSON.stringify({
        success: true,
        data: { id: productId, ...body, updated_at: now }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE - Delete product
    if (method === 'DELETE' && productId) {
      await db.prepare('DELETE FROM products WHERE id = ?').bind(productId).run();

      return new Response(JSON.stringify({
        success: true,
        message: 'Product deleted'
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
