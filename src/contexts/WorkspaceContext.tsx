import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/database.types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentMembership: WorkspaceMember | null;
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentMembership, setCurrentMembership] = useState<WorkspaceMember | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentMembership(null);
      setLoading(false);
      return;
    }

    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .rpc('get_user_workspaces', { user_uuid: user.id });

      if (workspaceError || !workspaceData || workspaceData.length === 0) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setCurrentMembership(null);
        setLoading(false);
        return;
      }

      // Convert workspace data to proper format
      const workspaces = workspaceData.map((w: any) => ({
        id: w.workspace_id,
        name: w.name,
        slug: w.slug,
        owner_id: w.owner_id,
        created_at: w.created_at,
        updated_at: w.updated_at,
      }));

      // Sort by updated_at
      workspaces.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setWorkspaces(workspaces);

      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const savedWorkspace = workspaces.find((w: any) => w.id === savedWorkspaceId);

      const initialWorkspace = savedWorkspace || workspaces[0];

      if (initialWorkspace) {
        setCurrentWorkspace(initialWorkspace);

        const membership = workspaceData.find((w: any) => w.workspace_id === initialWorkspace.id);
        if (membership) {
          setCurrentMembership({
            id: '',
            workspace_id: initialWorkspace.id,
            user_id: user.id,
            role: membership.role,
            invited_by: null,
            joined_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentMembership(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  useEffect(() => {
    if (currentWorkspace && user) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);

      supabase
        .rpc('get_user_workspaces', { user_uuid: user.id })
        .then(({ data }) => {
          if (data) {
            const membership = data.find((w: any) => w.workspace_id === currentWorkspace.id);
            if (membership) {
              setCurrentMembership({
                id: '',
                workspace_id: currentWorkspace.id,
                user_id: user.id,
                role: membership.role,
                invited_by: null,
                joined_at: new Date().toISOString(),
              });
            }
          }
        });
    }
  }, [currentWorkspace, user]);

  const value = {
    workspaces,
    currentWorkspace,
    currentMembership,
    loading,
    setCurrentWorkspace,
    refreshWorkspaces: fetchWorkspaces,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
