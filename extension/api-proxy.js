/**
 * Secure API Proxy Client for Extension
 * 
 * This module routes all Supabase requests through your secure backend API,
 * keeping Supabase keys server-side only.
 */

// Your production API URL (update this to your Vercel URL)
const API_BASE_URL = 'https://echo.analyzthis.ai'; // Change to your actual domain

/**
 * Proxy a request to Supabase through the secure backend
 * @param {string} endpoint - Supabase REST API endpoint (e.g., '/rest/v1/apps')
 * @param {Object} options - Fetch options (method, body, headers)
 * @returns {Promise<Response>}
 */
async function proxyRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Get auth token from storage
  const result = await chrome.storage.local.get(['authToken']);
  if (result.authToken) {
    headers['Authorization'] = `Bearer ${result.authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        method,
        body,
        headers,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Proxy request failed:', error);
    throw error;
  }
}

/**
 * Convenience methods for common Supabase operations
 */
const SupabaseProxy = {
  // GET request
  get: (endpoint, options = {}) => proxyRequest(endpoint, { ...options, method: 'GET' }),

  // POST request
  post: (endpoint, body, options = {}) => proxyRequest(endpoint, { ...options, method: 'POST', body }),

  // PUT request
  put: (endpoint, body, options = {}) => proxyRequest(endpoint, { ...options, method: 'PUT', body }),

  // PATCH request
  patch: (endpoint, body, options = {}) => proxyRequest(endpoint, { ...options, method: 'PATCH', body }),

  // DELETE request
  delete: (endpoint, options = {}) => proxyRequest(endpoint, { ...options, method: 'DELETE' }),

  // RPC call
  rpc: (functionName, params, options = {}) => 
    proxyRequest(`/rest/v1/rpc/${functionName}`, { ...options, method: 'POST', body: params }),
};

// Export for use in other extension files
if (typeof window !== 'undefined') {
  window.SupabaseProxy = SupabaseProxy;
}

// For background/service worker context
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  self.SupabaseProxy = SupabaseProxy;
}

