/**
 * Categories API - Uses Cloudflare D1 Binding
 */

export async function onRequest(context: any): Promise<Response> {
    const { request, env, params } = context;
    const db = env?.DB;
    const url = new URL(request.url);
    const method = request.method;
    const categoryId = params?.id as string | undefined;

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
        // Run idempotent column migrations on every request so PUT/GET/DELETE
        // also work even if the table predates these columns being added.
        try {
            for (const col of ['nav_font TEXT', 'nav_font_size TEXT', 'nav_color TEXT']) {
                try { await db.prepare(`ALTER TABLE categories ADD COLUMN ${col}`).run(); } catch { /* already exists */ }
            }
        } catch { /* table doesn't exist yet — POST will create it */ }

        // GET - Read categories
        if (method === 'GET') {
            let sql = 'SELECT * FROM categories';
            const bindParams: any[] = [];
            const conditions: string[] = [];

            if (categoryId) {
                conditions.push('id = ?');
                bindParams.push(categoryId);
            }

            const slug = url.searchParams.get('slug');
            if (slug) {
                conditions.push('slug = ?');
                bindParams.push(slug);
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            sql += ' ORDER BY created_at DESC';

            try {
                const { results } = await db.prepare(sql).bind(...bindParams).all();

                return new Response(JSON.stringify({
                    success: true,
                    data: results,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } catch (queryError: any) {
                // If table doesn't exist, it might be the first time, return empty but success
                if (queryError.message.includes('no such table')) {
                    return new Response(JSON.stringify({
                        success: true,
                        data: [],
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
                throw queryError;
            }
        }

        // POST - Create category
        if (method === 'POST') {
            const body = await request.json() as any;

            if (!body.name || !body.slug) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Missing required fields: name, slug'
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const id = body.id || crypto.randomUUID();
            const now = new Date().toISOString();

            // Ensure table exists
            await db.prepare(`
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL UNIQUE,
                    hero_color TEXT,
                    description TEXT,
                    nav_font TEXT,
                    nav_font_size TEXT,
                    nav_color TEXT,
                    created_at TEXT,
                    updated_at TEXT
                )
            `).run();

            const sql = `
                INSERT INTO categories (
                    id, name, slug, hero_color, description, nav_font, nav_font_size, nav_color, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await db.prepare(sql).bind(
                id, body.name, body.slug,
                body.hero_color || null, body.description || null,
                body.nav_font || null, body.nav_font_size || null,
                body.nav_color || null,
                now, now
            ).run();

            return new Response(JSON.stringify({
                success: true,
                data: { id, ...body, created_at: now, updated_at: now }
            }), {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // PUT - Update category
        if (method === 'PUT' && categoryId) {
            const body = await request.json() as any;
            const now = new Date().toISOString();
            const updates: string[] = [];
            const bindParams: any[] = [];

            const fields = ['name', 'slug', 'hero_color', 'description', 'nav_font', 'nav_font_size', 'nav_color'];

            fields.forEach(field => {
                if (body[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    bindParams.push(body[field]);
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

            // For the WHERE clause
            bindParams.push(categoryId);

            const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;
            await db.prepare(sql).bind(...bindParams).run();

            return new Response(JSON.stringify({
                success: true,
                data: { id: categoryId, ...body, updated_at: now }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // DELETE - Delete category
        if (method === 'DELETE' && categoryId) {
            await db.prepare('DELETE FROM categories WHERE id = ?').bind(categoryId).run();

            return new Response(JSON.stringify({
                success: true,
                message: 'Category deleted'
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
