import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * AuthConfirm - Universal auth confirmation endpoint
 * 
 * Handles all Supabase auth email confirmations:
 * - Email signup confirmation
 * - Password recovery
 * - Magic link login
 * - Email change confirmation
 * 
 * Uses PKCE flow with token_hash verification (recommended by Supabase)
 */
export function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | null;
      const next = searchParams.get('next') || '/dashboard';

      console.log('🔐 Auth confirmation:', { tokenHash: tokenHash?.slice(0, 10) + '...', type, next });

      if (!tokenHash || !type) {
        setError('Invalid confirmation link. Missing required parameters.');
        setLoading(false);
        return;
      }

      try {
        // Verify the OTP token using Supabase's OAuth server
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as any,
        });

        if (verifyError) {
          console.error('❌ Token verification failed:', verifyError);
          setError(verifyError.message || 'Failed to verify token. The link may have expired.');
          setLoading(false);
          return;
        }

        console.log('✅ Token verified successfully');

        // Redirect based on the type of confirmation
        switch (type) {
          case 'recovery':
            // Redirect to password reset page
            navigate('/reset-password', { replace: true });
            break;
          case 'email':
          case 'magiclink':
            // Redirect to dashboard or specified next URL
            navigate(next, { replace: true });
            break;
          case 'invite':
            // Redirect to onboarding or accept invitation
            navigate('/onboarding', { replace: true });
            break;
          case 'email_change':
            // Redirect to settings with success message
            navigate('/dashboard/settings?email_changed=true', { replace: true });
            break;
          default:
            navigate(next, { replace: true });
        }
      } catch (err: any) {
        console.error('❌ Auth confirmation error:', err);
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      }
    };

    handleAuthConfirmation();
  }, [searchParams, navigate]);

  // Loading state
  if (loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <img src="/logos/echo.svg" alt="Echo" className="h-12 w-auto" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-lg text-slate-700">Verifying your request...</span>
          </div>
          <p className="text-sm text-slate-500">Please wait while we confirm your authentication.</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Verification Failed</h2>
          <p className="text-slate-600 mb-6">
            {error || 'The confirmation link is invalid or has expired.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Back to Sign In
            </Link>
            <p className="text-sm text-slate-500">
              Need help? <a href="mailto:info@analyzthis.ai" className="text-blue-600 hover:underline">Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

