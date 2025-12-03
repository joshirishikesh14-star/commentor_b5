import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function NewApp() {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !user) return;

    setLoading(true);
    setError('');

    try {
      const { data: canCreate, error: checkError } = await supabase
        .rpc('can_user_create_app', { user_id: user.id });

      if (checkError) {
        console.error('Subscription check error:', checkError);
        setError(`Unable to verify your subscription status. Please try again or contact support if the issue persists. Error: ${checkError.message}`);
        setLoading(false);
        return;
      }

      if (!canCreate) {
        setError('You have reached your app limit on your current plan. Upgrade to Pro ($10/month) for up to 10 apps, or Enterprise for unlimited apps.');
        setLoading(false);
        return;
      }

      let normalizedUrl = baseUrl.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      try {
        new URL(normalizedUrl);
      } catch (urlError) {
        setError(`Invalid URL format. Please enter a valid website URL (e.g., https://example.com or example.com)`);
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('apps')
        .insert({
          workspace_id: currentWorkspace.id,
          name,
          base_url: normalizedUrl,
          description: description || null,
          owner_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('App creation error:', insertError);
        let errorMsg = 'Failed to create app. ';

        if (insertError.code === '23505') {
          errorMsg += 'An app with this name or URL already exists in your workspace.';
        } else if (insertError.code === '23503') {
          errorMsg += 'Workspace not found. Please refresh the page and try again.';
        } else if (insertError.message.includes('permission')) {
          errorMsg += 'You do not have permission to create apps in this workspace.';
        } else {
          errorMsg += insertError.message;
        }

        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Add creator as admin collaborator
      const { error: collaboratorError } = await supabase
        .from('app_collaborators')
        .insert({
          app_id: data.id,
          user_id: user.id,
          access_level: 'admin',
          invited_by: user.id,
        });

      if (collaboratorError) {
        console.error('Failed to add creator as admin:', collaboratorError);
      }

      navigate(`/dashboard/apps/${data.id}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`An unexpected error occurred. Please try again or contact support if the issue persists. ${err instanceof Error ? err.message : ''}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard/apps')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Apps</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New App</h1>
        <p className="text-slate-600 mb-6">
          Register a web application to start collecting contextual feedback
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              App Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="My Awesome App"
            />
          </div>

          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-700 mb-1">
              Base URL
            </label>
            <input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="https://example.com or example.com"
            />
            <p className="mt-1 text-xs text-slate-500">
              The main URL of your application where feedback will be collected
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Brief description of what this app does"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create App'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/apps')}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>After creating your app, you'll receive an embed script</li>
          <li>Add the script to your application's HTML</li>
          <li>Users can then comment directly on your app</li>
          <li>View and manage all feedback from this dashboard</li>
        </ol>
      </div>
    </div>
  );
}
