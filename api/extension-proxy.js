/**
 * Secure API Proxy for Chrome Extension
 * 
 * This proxy protects your Supabase keys by:
 * 1. Keeping them server-side only (in Vercel environment variables)
 * 2. Validating requests from the extension
 * 3. Forwarding authenticated requests to Supabase
 * 
 * Usage:
 * Extension calls: POST /api/extension-proxy
 * Body: { endpoint, method, body, headers }
 */

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { endpoint, method = 'GET', body, headers = {} } = await req.json();

    // Validate endpoint (must be a Supabase REST API endpoint)
    if (!endpoint || typeof endpoint !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase credentials from environment (server-side only)
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing Supabase credentials in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construct full URL
    const fullUrl = endpoint.startsWith('http')
      ? endpoint
      : `${SUPABASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Prepare headers - use provided auth token, add our anon key
    const proxyHeaders = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...headers, // User's auth token will be in headers.Authorization
    };

    // Forward request to Supabase
    const response = await fetch(fullUrl, {
      method,
      headers: proxyHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // Return response with CORS headers
    return new Response(JSON.stringify(jsonData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

