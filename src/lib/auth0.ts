import { createAuth0Client, Auth0Client, User } from '@auth0/auth0-spa-js';

let auth0Client: Auth0Client | null = null;

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: window.location.origin,
    scope: 'openid profile email',
  },
  cacheLocation: 'localstorage' as const,
};

export async function getAuth0Client(): Promise<Auth0Client | null> {
  // Only initialize if Auth0 is configured
  if (!auth0Config.domain || !auth0Config.clientId) {
    console.warn('⚠️ Auth0 not configured. Skipping Auth0 initialization.');
    return null;
  }

  if (!auth0Client) {
    try {
      auth0Client = await createAuth0Client(auth0Config);
    } catch (error) {
      console.error('Failed to initialize Auth0:', error);
      return null;
    }
  }
  return auth0Client;
}

export async function loginWithAuth0(connection?: 'google-oauth2' | 'github') {
  const client = await getAuth0Client();
  if (!client) {
    throw new Error('Auth0 not configured');
  }

  await client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin,
      ...(connection && { connection }),
    },
  });
}

export async function logoutAuth0() {
  const client = await getAuth0Client();
  if (!client) return;

  await client.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
}

export async function getAuth0User(): Promise<User | null> {
  const client = await getAuth0Client();
  if (!client) return null;

  try {
    const isAuthenticated = await client.isAuthenticated();
    if (!isAuthenticated) return null;
    return await client.getUser();
  } catch (error) {
    console.error('Error getting Auth0 user:', error);
    return null;
  }
}

export async function isAuth0Authenticated(): Promise<boolean> {
  const client = await getAuth0Client();
  if (!client) return false;

  try {
    return await client.isAuthenticated();
  } catch (error) {
    return false;
  }
}

export async function getAuth0IdToken(): Promise<string | null> {
  const client = await getAuth0Client();
  if (!client) return null;

  try {
    const claims = await client.getIdTokenClaims();
    return claims?.__raw || null;
  } catch (error) {
    console.error('Error getting Auth0 token:', error);
    return null;
  }
}

export async function handleAuth0Callback(): Promise<boolean> {
  const client = await getAuth0Client();
  if (!client) return false;

  try {
    // Check if we're handling an Auth0 callback
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
      await client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error handling Auth0 callback:', error);
    return false;
  }
}

