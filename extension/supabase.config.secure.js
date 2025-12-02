/**
 * SECURE CONFIG - For Distribution
 * 
 * This config file does NOT contain Supabase keys.
 * All requests go through the secure API proxy at your backend.
 */

window.SUPABASE_CONFIG = {
  // API Proxy URL - requests go through your secure backend
  apiProxyUrl: 'https://echo.analyzthis.ai/api/extension-proxy', // Update to your domain
  
  // These are NOT used when using the proxy, but kept for compatibility
  url: '', // Empty - not used
  anonKey: '', // Empty - not used
  
  // Flag to indicate we're using the proxy
  useProxy: true
};

