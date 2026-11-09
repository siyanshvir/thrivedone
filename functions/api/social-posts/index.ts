/**
 * Social Posts API - Cloudflare D1
 * Stores curated social media posts shown on landing page slideshow.
 */

export async function onRequest(context: any): Promise<Response> {
    const { request, env, params } = context;
    const db = env?.DB;
    const url = new URL(request.url);
    const method = request.method;
    const postId = params?.id as string | undefined;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!db) {
        return new Response(JSON.stringify({
            success: false,
            error: 'D1 binding (DB) not configured in Cloudflare Pages',
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Ensure table exists upfront so reads also work on fresh DB.
    try {
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS social_posts (
                id TEXT PRIMARY KEY,
                platform TEXT,
                image_url TEXT,
                caption TEXT,
                link TEXT,
                position INTEGER DEFAULT 0,
                active INTEGER DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            )
        `).run();
    } catch { /* ignore */ }

    try {
        if (method === 'GET') {
            let sql = 'SELECT * FROM social_posts';
            const bindParams: any[] = [];
            const conditions: string[] = [];

            if (postId) {
                conditions.push('id = ?');
                bindParams.push(postId);
            }

            const onlyActive = url.searchParams.get('active');
            if (onlyActive === '1') {
                conditions.push('active = 1');
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }

            sql += ' ORDER BY position ASC, created_at DESC';

            const { results } = await db.prepare(sql).bind(...bindParams).all();

            return new Response(JSON.stringify({
                success: true,
                data: results,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json() as any;

            if (!body.image_url) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Missing required field: image_url'
                }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const id = body.id || crypto.randomUUID();
            const now = new Date().toISOString();

            await db.prepare(`
                INSERT INTO social_posts (
                    id, platform, image_url, caption, link, position, active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                id,
                body.platform || null,
                body.image_url,
                body.caption || null,
                body.link || null,
                body.position ?? 0,
                body.active === false ? 0 : 1,
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

        if (method === 'PUT' && postId) {
            const body = await request.json() as any;
            const now = new Date().toISOString();
            const updates: string[] = [];
            const bindParams: any[] = [];

            const fields = ['platform', 'image_url', 'caption', 'link', 'position', 'active'];
            fields.forEach(field => {
                if (body[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    let v: any = body[field];
                    if (field === 'active') v = v ? 1 : 0;
                    bindParams.push(v);
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
            bindParams.push(postId);

            const sql = `UPDATE social_posts SET ${updates.join(', ')} WHERE id = ?`;
            await db.prepare(sql).bind(...bindParams).run();

            return new Response(JSON.stringify({
                success: true,
                data: { id: postId, ...body, updated_at: now }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE' && postId) {
            await db.prepare('DELETE FROM social_posts WHERE id = ?').bind(postId).run();
            return new Response(JSON.stringify({
                success: true,
                message: 'Social post deleted'
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
        console.error('Social Posts API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Internal server error'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
