import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ExternalLink, Clock, User, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type App = Database['public']['Tables']['apps']['Row'];
type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

type SharedApp = {
  app: App;
  workspace: Workspace;
  membershipInfo: {
    role: string;
    joined_at: string;
    invited_by_name: string | null;
    invited_by_email: string | null;
  };
};

export function SharedWithMe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sharedApps, setSharedApps] = useState<SharedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSharedApps();
    }
  }, [user]);

  const fetchSharedApps = async () => {
    if (!user) return;

    const { data: memberships, error: memberError } = await supabase
      .from('workspace_members')
      .select(`
        role,
        joined_at,
        invited_by,
        workspace_id,
        workspaces!inner(id, name, owner_id)
      `)
      .eq('user_id', user.id)
      .neq('workspaces.owner_id', user.id);

    if (memberError) {
      console.error('Error fetching workspace memberships:', memberError);
      setLoading(false);
      return;
    }

    if (!memberships || memberships.length === 0) {
      setLoading(false);
      return;
    }

    const workspaceIds = memberships.map((m: any) => m.workspace_id);

    const { data: apps, error: appsError } = await supabase
      .from('apps')
      .select('*')
      .in('workspace_id', workspaceIds)
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error('Error fetching shared apps:', appsError);
      setLoading(false);
      return;
    }

    const inviterIds = memberships
      .map((m: any) => m.invited_by)
      .filter(Boolean);

    let invitersMap: Record<string, any> = {};
    if (inviterIds.length > 0) {
      const { data: inviters } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', inviterIds);

      if (inviters) {
        invitersMap = Object.fromEntries(
          inviters.map((inv) => [inv.id, inv])
        );
      }
    }

    const shared: SharedApp[] = (apps || []).map((app) => {
      const membership = memberships.find(
        (m: any) => m.workspace_id === app.workspace_id
      );
      const inviter = membership?.invited_by
        ? invitersMap[membership.invited_by]
        : null;

      return {
        app,
        workspace: (membership as any).workspaces,
        membershipInfo: {
          role: membership?.role || 'commenter',
          joined_at: membership?.joined_at || app.created_at,
          invited_by_name: inviter?.full_name || null,
          invited_by_email: inviter?.email || null,
        },
      };
    });

    setSharedApps(shared);
    setLoading(false);
  };

  const handleOpenReview = (appId: string) => {
    navigate(`/review/${appId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Shared With Me</h1>
        <p className="text-slate-600">Apps from workspaces you've been invited to</p>
      </div>

      {sharedApps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No Shared Apps Yet
          </h2>
          <p className="text-slate-600">
            You haven't been invited to any workspaces yet. When someone invites you to their workspace, all apps from that workspace will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedApps.map((shared) => (
            <div
              key={shared.app.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {shared.app.name}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {shared.app.base_url}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                  {shared.membershipInfo.role}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span className="truncate">
                    {shared.workspace.name}
                  </span>
                </div>
                {shared.membershipInfo.invited_by_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="truncate">
                      Invited by {shared.membershipInfo.invited_by_name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(shared.membershipInfo.joined_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenReview(shared.app.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Review</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
