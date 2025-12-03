import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  getAuth0Client, 
  getAuth0User, 
  handleAuth0Callback, 
  isAuth0Authenticated,
  loginWithAuth0,
  logoutAuth0 
} from '../lib/auth0';

// Unified user type that can be from Supabase or Auth0
interface UnifiedUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  authProvider: 'supabase' | 'auth0';
  supabaseUser?: User;
  auth0User?: any; // Auth0 User type
}

interface AuthContextType {
  user: UnifiedUser | null;
  session: Session | null; // Supabase session (null for Auth0 users)
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: { user: User | null } }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signInWithAuth0: (connection?: 'google-oauth2' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Auth0 user to Supabase and create a proper Supabase session
  // This allows Auth0 users to benefit from Supabase RLS policies
  const syncAuth0UserToProfile = async (auth0User: any): Promise<{ profileId: string; session: any } | null> => {
    try {
      console.log('🔄 Creating Supabase session for Auth0 user...');
      
      // Call our edge function to create profile + auth user + verification token
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth0-create-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ auth0User }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Edge function error:', result);
        return null;
      }

      console.log('✅ Profile and auth user created:', result.profileId);

      // If we have a verification token, verify it to create a session
      if (result.sessionCreated && result.verificationToken) {
        const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
          email: auth0User.email,
          token: result.verificationToken,
          type: result.verificationType || 'magiclink',
        });

        if (verifyError || !sessionData.session) {
          console.error('Error verifying token:', verifyError);
          // Fallback: return profile ID without session
          return { profileId: result.profileId, session: null };
        }

        console.log('✅ Supabase session created via token verification');
        return { profileId: result.profileId, session: sessionData.session };
      }

      // No session created, return profile ID only
      return { profileId: result.profileId, session: null };
    } catch (error) {
      console.error('Error syncing Auth0 user:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, handle Auth0 callback (if present)
        const isAuth0Callback = await handleAuth0Callback();
        
        if (isAuth0Callback) {
          // Auth0 callback handled, check for Auth0 user
          const auth0Authenticated = await isAuth0Authenticated();
          if (auth0Authenticated) {
            const auth0User = await getAuth0User();
            if (auth0User) {
              // Sync to profiles and create Supabase session
              const result = await syncAuth0UserToProfile(auth0User);
              
              if (result) {
                const unifiedUser: UnifiedUser = {
                  id: result.profileId, // Use profile ID
                  email: auth0User.email,
                  name: auth0User.name,
                  picture: auth0User.picture,
                  authProvider: result.session ? 'supabase' : 'auth0', // If we have a Supabase session, use that
                  auth0User,
                  supabaseUser: result.session?.user,
                };
                
                setUser(unifiedUser);
                setSession(result.session); // Set Supabase session if created
                
                if (result.session) {
                  console.log('✅ Auth0 user now has Supabase session');
                } else {
                  console.log('⚠️ Auth0 user without Supabase session (limited functionality)');
                }
                
                // Clean up the URL to remove Auth0 callback parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                
                setLoading(false);
                // Let React Router's RootRedirect handle navigation based on workspace status
              } else {
                setLoading(false);
              }
              return;
            }
          }
        }

        // Check for Supabase OAuth callback (existing functionality)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('🔐 Supabase OAuth callback detected, processing...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Supabase OAuth error:', error);
          } else if (session) {
            console.log('✅ Supabase OAuth session established');
      setSession(session);
            
            const unifiedUser: UnifiedUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name,
              picture: session.user.user_metadata?.avatar_url,
              authProvider: 'supabase',
              supabaseUser: session.user,
            };
            
            setUser(unifiedUser);
            
            // Clean up URL hash
            window.history.replaceState(null, '', window.location.pathname);
            
            setLoading(false);
            // Let React Router's RootRedirect handle navigation based on workspace status
            return;
          }
          
          setLoading(false);
          return;
        }

        // Check Supabase session first (existing users)
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession) {
          // Supabase user logged in
          const unifiedUser: UnifiedUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email,
            name: supabaseSession.user.user_metadata?.full_name,
            picture: supabaseSession.user.user_metadata?.avatar_url,
            authProvider: 'supabase',
            supabaseUser: supabaseSession.user,
          };
          
          setUser(unifiedUser);
          setSession(supabaseSession);
          setLoading(false);
          return;
        }

        // Check Auth0 session (if no Supabase session)
        const auth0Authenticated = await isAuth0Authenticated();
        if (auth0Authenticated) {
          const auth0User = await getAuth0User();
          if (auth0User) {
            const result = await syncAuth0UserToProfile(auth0User);
            
            if (result) {
              const unifiedUser: UnifiedUser = {
                id: result.profileId,
                email: auth0User.email,
                name: auth0User.name,
                picture: auth0User.picture,
                authProvider: result.session ? 'supabase' : 'auth0',
                auth0User,
                supabaseUser: result.session?.user,
              };
              
              setUser(unifiedUser);
              setSession(result.session);
              setLoading(false);
              return;
            }
          }
        }

        // No active session
        setUser(null);
        setSession(null);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
      setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Supabase auth changes (existing functionality)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const unifiedUser: UnifiedUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
          picture: session.user.user_metadata?.avatar_url,
          authProvider: 'supabase',
          supabaseUser: session.user,
        };
        
        setUser(unifiedUser);
        setSession(session);
      } else {
        // Check Auth0 if Supabase session is gone
        const auth0Authenticated = await isAuth0Authenticated();
        if (auth0Authenticated) {
          const auth0User = await getAuth0User();
          if (auth0User) {
            const profileId = await syncAuth0UserToProfile(auth0User);
            
            if (profileId) {
              const unifiedUser: UnifiedUser = {
                id: profileId, // Use profile ID, not Auth0 sub
                email: auth0User.email,
                name: auth0User.name,
                picture: auth0User.picture,
                authProvider: 'auth0',
                auth0User,
              };
              
              setUser(unifiedUser);
              setSession(null);
            } else {
              setUser(null);
              setSession(null);
            }
          } else {
            setUser(null);
            setSession(null);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      }
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Always use Supabase for email/password signup (existing functionality)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Always use Supabase for email/password login (existing functionality)
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error, data: { user: data.user } };
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    // Supabase OAuth (existing functionality)
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const redirectTo = `${appUrl}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithAuth0 = async (connection?: 'google-oauth2' | 'github') => {
    // Auth0 OAuth (new)
    try {
      await loginWithAuth0(connection);
    } catch (error) {
      console.error('Auth0 login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    // Sign out from both providers
    if (user?.authProvider === 'auth0') {
      await logoutAuth0();
    } else {
    await supabase.auth.signOut();
    }
    
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signInWithAuth0,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
