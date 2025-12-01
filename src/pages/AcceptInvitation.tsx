import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    if (!user) {
      const redirectUrl = `${window.location.origin}/accept-invitation?token=${token}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    acceptInvitation(token);
  }, [user, authLoading, searchParams, navigate]);

  const acceptInvitation = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_app_invitation', {
        invitation_token_param: token,
      });

      if (error) throw error;

      if (data?.success) {
        setStatus('success');
        setMessage(
          data.added_to_workspace
            ? 'Invitation accepted! You now have access to this app and workspace.'
            : 'Invitation accepted! You now have access to this app.'
        );
        setAppId(data.app_id);

        setTimeout(() => {
          navigate(`/review/${data.app_id}`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data?.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setMessage('An error occurred while accepting the invitation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Processing Invitation</h1>
              <p className="text-slate-400">Please wait while we set up your access...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invitation Accepted!</h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <div className="text-sm text-slate-500">
                Redirecting to app review...
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
              <p className="text-slate-400 mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
