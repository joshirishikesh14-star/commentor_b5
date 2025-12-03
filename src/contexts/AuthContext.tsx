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
import { checkUserWorkspaces } from '../lib/workspaceHelpers';
import { useNavigate } from 'react-router-dom';

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

  // Sync Auth0 user to Supabase profiles table
  // Returns the profile ID (UUID) for use in RLS and queries
  const syncAuth0UserToProfile = async (auth0User: any): Promise<string | null> => {
    try {
      const auth0Id = auth0User.sub; // e.g., "auth0|123456" or "google-oauth2|123456"
      
      // Check if profile exists with this auth0_id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, auth0_id')
        .eq('auth0_id', auth0Id)
        .single();

      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('profiles')
          .update({
            email: auth0User.email,
            full_name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            avatar_url: auth0User.picture,
            updated_at: new Date().toISOString(),
          })
          .eq('auth0_id', auth0Id);
        
        console.log('✅ Auth0 user profile updated:', existingProfile.id);
        return existingProfile.id;
      } else {
        // Check if user exists by email (link existing account)
        if (auth0User.email) {
          const { data: emailProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', auth0User.email)
            .single();

          if (emailProfile) {
            // Link Auth0 to existing profile
            await supabase
              .from('profiles')
              .update({
                auth0_id: auth0Id,
                avatar_url: auth0User.picture,
                updated_at: new Date().toISOString(),
              })
              .eq('id', emailProfile.id);
            
            console.log('✅ Auth0 linked to existing profile:', emailProfile.id);
            return emailProfile.id;
          }
        }

        // Create new profile for Auth0 user
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({
            auth0_id: auth0Id,
            email: auth0User.email,
            full_name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            avatar_url: auth0User.picture,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating Auth0 profile:', error);
          return null;
        }

        console.log('✅ New Auth0 user profile created:', newProfile.id);
        return newProfile.id;
      }
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
              // Sync to profiles and get profile ID
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
                setSession(null); // No Supabase session for Auth0 users
                setLoading(false);
                
                // Redirect based on workspace status
                const workspacePath = await checkUserWorkspaces(profileId);
                if (workspacePath) {
                  window.location.href = workspacePath;
                } else {
                  window.location.href = '/onboarding';
                }
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
            
            // Redirect based on workspace status
            const workspacePath = await checkUserWorkspaces(session.user.id);
            if (workspacePath) {
              window.location.href = workspacePath;
            } else {
              window.location.href = '/onboarding';
            }
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
