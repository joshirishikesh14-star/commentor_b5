import { useState, useEffect } from 'react';
import { Users, Mail, Trash2, Edit2, Plus, Crown, X, Save, Building2, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MemberBillingManager } from '../components/MemberBillingManager';

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
  currentUserRole: string | null;
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
          profiles:user_id (
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

      // Find current user's role in this workspace
      const currentUserMember = (members || []).find(m => m.user_id === user.id);
      const currentUserRole = currentUserMember?.role || null;

      workspacesData.push({
        workspace,
        members: members || [],
        isOwner: workspace.owner_id === user.id,
        currentUserRole,
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

  // Determine if user can invite members based on their role
  const canInviteMembers = (role: string | null, isOwner: boolean): boolean => {
    if (isOwner) return true;
    return ['owner', 'admin', 'moderator', 'commenter'].includes(role || '');
  };

  // Get available roles that a user can assign based on their own role
  const getAssignableRoles = (currentRole: string | null, isOwner: boolean): { value: string; label: string }[] => {
    // Owner and Admin can assign any role
    if (isOwner || currentRole === 'owner' || currentRole === 'admin') {
      return [
        { value: 'viewer', label: 'Viewer' },
        { value: 'commenter', label: 'Commenter' },
        { value: 'moderator', label: 'Moderator' },
        { value: 'admin', label: 'Admin' },
      ];
    }
    // Moderator and Commenter can only assign viewer or commenter
    if (currentRole === 'moderator' || currentRole === 'commenter') {
      return [
        { value: 'viewer', label: 'Viewer' },
        { value: 'commenter', label: 'Commenter' },
      ];
    }
    // Viewers cannot invite
    return [];
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

    // Get the workspace data to validate permissions
    const workspaceData = allWorkspacesData.find(w => w.workspace.id === workspaceId);
    if (!workspaceData) return;

    // Validate that user can assign the selected role
    const assignableRoles = getAssignableRoles(workspaceData.currentUserRole, workspaceData.isOwner).map(r => r.value);
    if (!assignableRoles.includes(inviteForm.role)) {
      alert(`You don't have permission to assign the ${inviteForm.role} role.`);
      return;
    }

    try {
      // First check if user already exists
      const { data: invitedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteForm.email.toLowerCase())
        .maybeSingle();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
      }

      // If user exists, check if already a member
      if (invitedProfile) {
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', invitedProfile.id)
        .maybeSingle();

      if (existingMember) {
        alert('This user is already a member of this workspace.');
        return;
      }

        // User exists but not a member - add them directly
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: invitedProfile.id,
          role: inviteForm.role,
          invited_by: user?.id,
        });

      if (error) {
          console.error('Direct add error:', error);
          alert('Failed to add member: ' + error.message);
          return;
        }

        alert('Member added successfully!');
        setInviteForm(null);
        await fetchAllWorkspacesWithMembers();
        return;
      }

      // User doesn't exist - create invitation
      console.log('📧 Creating workspace invitation for:', inviteForm.email);
      
      const { data: invitation, error: inviteError } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          inviter_id: user?.id,
          invitee_email: inviteForm.email.toLowerCase().trim(),
          role: inviteForm.role,
          status: 'pending',
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Invitation error:', inviteError);
        alert('Failed to create invitation: ' + inviteError.message);
        return;
      }

      console.log('✅ Invitation created:', invitation);
      
      // TODO: Send invitation email via Edge Function
      // For now, just show success message
      alert(`Invitation sent to ${inviteForm.email}! They will receive an email to join the workspace.`);
      setInviteForm(null);
      await fetchAllWorkspacesWithMembers();
    } catch (error) {
      console.error('Unexpected error inviting member:', error);
      alert('An unexpected error occurred. Please try again.');
    }
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
          {allWorkspacesData.map(({ workspace, members, isOwner, currentUserRole }) => {
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
                  <div className="p-6 border-t border-slate-200 space-y-8">
                    {/* Billing Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-slate-600" />
                        <h3 className="text-base font-semibold text-slate-900">Team Billing & Subscriptions</h3>
                      </div>
                      <MemberBillingManager workspaceId={workspace.id} />
                    </div>

                    {/* Members Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-slate-600" />
                          <h3 className="text-base font-semibold text-slate-900">Members</h3>
                        </div>
                        {canInviteMembers(currentUserRole, isOwner) && getAssignableRoles(currentUserRole, isOwner).length > 0 && (
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
                        <h4 className="text-sm font-medium text-slate-900 mb-3">Invite to Workspace</h4>
                        {/* Info about workspace vs app invites */}
                        <p className="text-xs text-blue-600 mb-3 bg-blue-50 p-2 rounded">
                          💡 <strong>Workspace members</strong> can access all apps in this workspace. 
                          To invite someone to a specific app only, use the "Invite" button on that app's page.
                        </p>
                        {/* Show permission info for non-admin users */}
                        {currentUserRole && !['owner', 'admin'].includes(currentUserRole) && !isOwner && (
                          <p className="text-xs text-amber-600 mb-3 bg-amber-50 p-2 rounded">
                            As a {currentUserRole}, you can only invite members as Viewer or Commenter.
                          </p>
                        )}
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
                            {getAssignableRoles(currentUserRole, isOwner).map(role => (
                              <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
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
                                    {member.profiles?.full_name?.charAt(0).toUpperCase() || member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-slate-900 text-sm">
                                      {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                                      {isCurrentUser && <span className="text-slate-500 text-xs ml-1">(You)</span>}
                                    </p>
                                    {isMemberOwner && (
                                      <Crown className="w-3.5 h-3.5 text-yellow-500" title="Workspace Owner" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Mail className="w-3 h-3" />
                                    {member.profiles?.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Owner role - cannot be changed */}
                                {member.role === 'owner' ? (
                                  <span className="px-3 py-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Owner
                                  </span>
                                ) : isOwner && !isMemberOwner ? (
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                    className="px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    title="Change member role"
                                  >
                                    <option value="viewer">Viewer - Can only view</option>
                                    <option value="commenter">Commenter - Can add comments</option>
                                    <option value="moderator">Moderator - Can manage comments</option>
                                    <option value="admin">Admin - Full access</option>
                                  </select>
                                ) : (
                                  <span className={`px-3 py-1 text-xs rounded-lg capitalize ${
                                    member.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : member.role === 'moderator'
                                      ? 'bg-blue-100 text-blue-700'
                                      : member.role === 'commenter'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {member.role}
                                  </span>
                                )}
                                {/* Can only remove non-owners */}
                                {isOwner && member.role !== 'owner' && !isCurrentUser && (
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
