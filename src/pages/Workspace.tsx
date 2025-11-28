import { useState, useEffect } from 'react';
import { Users, Mail, Trash2, Edit2, Plus, Crown, X, Save, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface WorkspaceWithMembers {
  workspace: any;
  members: WorkspaceMember[];
  isOwner: boolean;
}

export function Workspace() {
  const { workspaces, refreshWorkspaces } = useWorkspace();
  const { user } = useAuth();
  const [allWorkspacesData, setAllWorkspacesData] = useState<WorkspaceWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [inviteForm, setInviteForm] = useState<{ workspaceId: string; email: string; role: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  useEffect(() => {
    fetchAllWorkspacesWithMembers();
  }, [workspaces, user]);

  const fetchAllWorkspacesWithMembers = async () => {
    if (!user || !workspaces.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const workspacesData: WorkspaceWithMembers[] = [];

    for (const workspace of workspaces) {
      const { data: members, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          profiles (
            full_name,
            email
          )
        `)
        .eq('workspace_id', workspace.id)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching members for workspace:', workspace.name, error);
      } else {
        console.log('Members for workspace:', workspace.name, members);
      }

      workspacesData.push({
        workspace,
        members: members || [],
        isOwner: workspace.owner_id === user.id,
      });
    }

    setAllWorkspacesData(workspacesData);
    setLoading(false);
  };

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newWorkspaceName.trim()) return;

    setCreatingWorkspace(true);

    const slug = generateSlug(newWorkspaceName);

    const { data: existingWorkspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', slug)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (existingWorkspace) {
      alert('You already have a workspace with this name. Please choose a different name.');
      setCreatingWorkspace(false);
      return;
    }

    const { data, error: createError } = await supabase
      .rpc('create_workspace_with_member', {
        workspace_name: newWorkspaceName.trim(),
        workspace_slug: slug,
      });

    if (createError) {
      console.error('Workspace creation error:', createError);
      alert('Failed to create workspace: ' + createError.message);
      setCreatingWorkspace(false);
      return;
    }

    if (!data) {
      alert('Failed to create workspace - no data returned');
      setCreatingWorkspace(false);
      return;
    }

    await refreshWorkspaces();
    setNewWorkspaceName('');
    setShowCreateWorkspace(false);
    setCreatingWorkspace(false);
  };

  const handleUpdateWorkspace = async (workspaceId: string) => {
    if (!editingName.trim()) return;

    const { error } = await supabase
      .from('workspaces')
      .update({ name: editingName.trim() })
      .eq('id', workspaceId);

    if (error) {
      alert('Failed to update workspace');
      return;
    }

    await refreshWorkspaces();
    setEditingWorkspace(null);
    setEditingName('');
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspaceId);

    if (error) {
      alert('Failed to delete workspace');
      return;
    }

    await refreshWorkspaces();
    setShowDeleteConfirm(null);
  };

  const handleInviteMember = async (workspaceId: string) => {
    if (!inviteForm || !inviteForm.email.trim()) return;

    const { data: invitedProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteForm.email.toLowerCase())
      .maybeSingle();

    if (!invitedProfile) {
      alert('User not found. They need to sign up first.');
      return;
    }

    const { error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: invitedProfile.id,
        role: inviteForm.role,
        invited_by: user?.id,
      });

    if (error) {
      alert(error.message || 'Failed to invite member');
      return;
    }

    setInviteForm(null);
    await fetchAllWorkspacesWithMembers();
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      alert('Failed to update member role');
      return;
    }

    await fetchAllWorkspacesWithMembers();
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      alert('Failed to remove member');
      return;
    }

    await fetchAllWorkspacesWithMembers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workspace Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all your workspaces and their members
          </p>
        </div>
        <button
          onClick={() => setShowCreateWorkspace(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Building2 className="w-4 h-4" />
          Create Workspace
        </button>
      </div>

      {allWorkspacesData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">You don't have any workspaces yet</p>
          <button
            onClick={() => setShowCreateWorkspace(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {allWorkspacesData.map(({ workspace, members, isOwner }) => {
            const isExpanded = expandedWorkspaces.has(workspace.id);
            const isEditing = editingWorkspace === workspace.id;

            return (
              <div
                key={workspace.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => toggleWorkspace(workspace.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Workspace name"
                            />
                            <button
                              onClick={() => handleUpdateWorkspace(workspace.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingWorkspace(null);
                                setEditingName('');
                              }}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900">{workspace.name}</h2>
                            {isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-slate-500">
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                          </p>
                          <p className="text-sm text-slate-500">
                            Created {new Date(workspace.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingWorkspace(workspace.id);
                            setEditingName(workspace.name);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(workspace.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-600" />
                        <h3 className="text-base font-semibold text-slate-900">Members</h3>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => setInviteForm({ workspaceId: workspace.id, email: '', role: 'commenter' })}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Invite Member
                        </button>
                      )}
                    </div>

                    {inviteForm?.workspaceId === workspace.id && (
                      <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="text-sm font-medium text-slate-900 mb-3">Invite New Member</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                            placeholder="Email address"
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="commenter">Commenter</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleInviteMember(workspace.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                          >
                            Send Invite
                          </button>
                          <button
                            onClick={() => setInviteForm(null)}
                            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {members.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No members yet. Invite someone to get started.
                        </div>
                      ) : (
                        members.map((member) => {
                          const isCurrentUser = member.user_id === user?.id;
                          const isMemberOwner = member.user_id === workspace.owner_id;

                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {member.profiles.full_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900 text-sm">
                                      {member.profiles.full_name}
                                      {isCurrentUser && <span className="text-slate-500 text-xs ml-1">(You)</span>}
                                    </p>
                                    {isMemberOwner && (
                                      <Crown className="w-3.5 h-3.5 text-yellow-500" title="Workspace Owner" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Mail className="w-3 h-3" />
                                    {member.profiles.email}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isOwner && !isMemberOwner ? (
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                    className="px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    title="Change member role"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="commenter">Commenter</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                ) : (
                                  <span className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-lg capitalize">
                                    {member.role}
                                  </span>
                                )}
                                {isOwner && !isMemberOwner && !isCurrentUser && (
                                  <button
                                    onClick={() => handleRemoveMember(member.id, member.user_id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Remove member"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Workspace</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this workspace? This will permanently delete all apps, comments, and data associated with this workspace. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWorkspace(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Create New Workspace</h3>
            <p className="text-slate-600 mb-6">
              Create a new workspace to organize your apps and collaborate with your team.
            </p>
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Team Workspace"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateWorkspace(false);
                    setNewWorkspaceName('');
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWorkspace}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creatingWorkspace ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
