/**
 * Image Upload API - Uploads to imgbb
 * 
 * POST /api/upload
 * 
 * Body: multipart/form-data with 'file' field
 * Query params:
 * ?sku=PRODUCT-SKU (optional, for naming)
 * 
 * Returns: { success: true, url: "https://..." }
 */

interface Env {}

// imgbb API key - get yours at https://api.imgbb.com/
const IMGBB_API_KEY = "4c3c44f04422ee338ac6ae2e1e21b8b7";

export const onRequest: any = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('📤 Upload API called');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Content-Type:', request.headers.get('content-type'));
    
    const formData = await request.formData();
    console.log('FormData parsed successfully');
    
    const file = formData.get('file') as File;
    console.log('File from formData:', file ? `${file.name} (${file.size} bytes)` : 'null');

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No file provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert file to base64 for imgbb
    console.log('🔄 Converting image to base64...');
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Upload to imgbb
    console.log('🌐 Preparing upload to imgbb...');
    
    const upstreamForm = new FormData();
    upstreamForm.append('image', base64);
    upstreamForm.append('key', IMGBB_API_KEY);
    
    // Optional: add name from SKU
    const sku = url.searchParams.get('sku');
    if (sku) {
      upstreamForm.append('name', sku);
    }

    console.log('📡 Sending request to imgbb...');
    const upstreamResp = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: upstreamForm,
    });

    console.log('📥 imgbb response status:', upstreamResp.status);
    console.log('📥 imgbb response content-type:', upstreamResp.headers.get('content-type'));

    const contentType = String(upstreamResp.headers.get('content-type') || '');
    let upstreamJson: any = null;
    let upstreamText: string | null = null;
    
    if (contentType.includes('application/json')) {
      upstreamJson = await upstreamResp.json().catch(() => null);
      console.log('📄 Parsed JSON response:', upstreamJson);
    } else {
      upstreamText = await upstreamResp.text().catch(() => null);
      console.log('📄 Text response:', upstreamText);
    }

    if (!upstreamResp.ok || !upstreamJson?.success) {
      const rawMsg =
        upstreamJson?.error?.message ||
        upstreamText ||
        `imgbb upload failed (${upstreamResp.status})`;

      const msg = String(rawMsg || '').trim();

      console.error('❌ Upload failed:', msg);

      return new Response(
        JSON.stringify({
          success: false,
          error: msg || 'Upload failed',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const directUrl = upstreamJson?.data?.url || upstreamJson?.data?.display_url;
    const thumbUrl = upstreamJson?.data?.thumb?.url;

    console.log('✅ Upload successful!');
    console.log('Direct URL:', directUrl);
    console.log('Thumb URL:', thumbUrl);

    if (!directUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'imgbb upload succeeded but did not return a direct URL.',
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      url: directUrl,
      thumb_url: thumbUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌❌❌ Upload Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Upload failed',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
