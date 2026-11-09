/**
 * Products API - Single Product Operations (GET, PUT, DELETE)
 * Route: /api/products/:id
 */

const ACCOUNT_ID = 'd02ac96518404ff3aba663e31bfdae28';
const DATABASE_ID = '7aacb7e5-67f2-4466-b4bc-ca2841e618af';

async function queryD1(apiToken: string, sql: string, params: any[] = []): Promise<any> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  
  console.log('D1 Query:', sql);
  console.log('D1 Params:', JSON.stringify(params));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  const data = await response.json();
  
  console.log('D1 Response:', JSON.stringify(data));
  
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'D1 query failed');
  }

  return data.result?.[0]?.results || [];
}

export async function onRequest(context: any): Promise<Response> {
  const { request, env, params } = context;
  const method = request.method;
  const productId = params.id;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiToken = env.CF_API_TOKEN;
  if (!apiToken) {
    return new Response(JSON.stringify({
      success: false,
      error: 'CF_API_TOKEN not configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (!productId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Product ID required'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // GET - Get single product
    if (method === 'GET') {
      const results = await queryD1(apiToken, 'SELECT * FROM products WHERE id = ?', [productId]);

      return new Response(JSON.stringify({
        success: true,
        data: results[0] || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // PUT - Update product
    if (method === 'PUT') {
      const body = await request.json();
      const now = new Date().toISOString();
      const updates: string[] = [];
      const params: any[] = [];

      const fields = [
        'name', 'description', 'category', 'status', 'sku', 'price',
        'buy_link', 'image_url', 'group_name', 'color', 'hex_color',
        'specifications', 'variant_order', 'secondary_hex_color',
        'clearance_price'
      ];

      fields.forEach(field => {
        if (body[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(field === 'specifications' ? JSON.stringify(body[field]) : body[field]);
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
      params.push(now);
      params.push(productId);

      const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
      await queryD1(apiToken, sql, params);

      return new Response(JSON.stringify({
        success: true,
        data: { id: productId, ...body, updated_at: now }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // DELETE - Delete product
    if (method === 'DELETE') {
      await queryD1(apiToken, 'DELETE FROM products WHERE id = ?', [productId]);

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
