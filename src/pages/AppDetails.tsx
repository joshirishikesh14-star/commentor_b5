import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  MessageSquare,
  X,
  Send,
  Paperclip,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Share2,
  UserPlus,
  Mail,
  ExternalLink,
  Trash2,
  CheckCircle,
  RefreshCw,
  Edit,
  Save,
  Users,
  Crown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { syncThreadToJira } from '../lib/jiraSyncEngine';
import { uploadAttachment, formatFileSize, getFileIcon, isImageFile, type Attachment } from '../lib/attachments';
import type { Database } from '../lib/database.types';

type App = Database['public']['Tables']['apps']['Row'];
type Thread = Database['public']['Tables']['threads']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

interface ThreadWithComments extends Thread {
  comments: (Comment & {
    author: {
      full_name: string | null;
      email: string;
    };
  })[];
}

interface CommentPin {
  threadId: string;
  x: number;
  y: number;
}

export function AppDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [app, setApp] = useState<App | null>(null);
  const [threads, setThreads] = useState<ThreadWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ThreadWithComments | null>(null);
  const [commentPins, setCommentPins] = useState<CommentPin[]>([]);
  const [replyText, setReplyText] = useState('');
  const [showCommentOverlay, setShowCommentOverlay] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCommentsSidebarCollapsed, setIsCommentsSidebarCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingThread, setDeletingThread] = useState<ThreadWithComments | null>(null);
  const [syncingToJira, setSyncingToJira] = useState(false);
  const [jiraSyncStatus, setJiraSyncStatus] = useState<{threadId: string, issueKey: string} | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [screenshotForPage, setScreenshotForPage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [commentMenuOpen, setCommentMenuOpen] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'commenter' | 'moderator'>('commenter');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [currentUserAccessLevel, setCurrentUserAccessLevel] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [loadingShareToken, setLoadingShareToken] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState<'screenshot' | 'live' | 'dom'>('screenshot');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const domRendererRef = useRef<HTMLIFrameElement>(null);
  const screenshotRef = useRef<HTMLImageElement>(null);
  const [iframeFailed, setIframeFailed] = useState(false);
  const [screenshotScale, setScreenshotScale] = useState(1);
  const [htmlSnapshotForPage, setHtmlSnapshotForPage] = useState<any>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [appCollaborators, setAppCollaborators] = useState<{
    id: string;
    user_id: string;
    access_level: string;
    invited_by: string | null;
    invited_at: string;
    profile: { full_name: string | null; email: string };
    inviter: { full_name: string | null; email: string } | null;
  }[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAppDetails();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const threadsChannel = supabase
      .channel(`threads:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          filter: `app_id=eq.${id}`,
        },
        () => {
          fetchAppDetails();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel(`comments:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        () => {
          fetchAppDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(threadsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [id]);

  useEffect(() => {
    if (threads.length > 0) {
      const uniquePages = Array.from(new Set(threads.map(t => t.page_url)));
      if (!selectedPageUrl && uniquePages.length > 0) {
        setSelectedPageUrl(uniquePages[0]);
      }
    }
  }, [threads]);

  useEffect(() => {
    if (selectedPageUrl && threads.length > 0) {
      const pageThreads = threads.filter(t => t.page_url === selectedPageUrl);
      updateCommentPins(pageThreads);

      // Find thread with screenshot
      const threadWithScreenshot = pageThreads.find(t => {
        const firstComment = t.comments[0];
        if (!firstComment?.metadata) return false;
        const metadata = typeof firstComment.metadata === 'string'
          ? JSON.parse(firstComment.metadata)
          : firstComment.metadata;
        return metadata && 'screenshot' in metadata && metadata.screenshot;
      });

      let hasScreenshot = false;
      if (threadWithScreenshot) {
        const firstComment = threadWithScreenshot.comments[0];
        const metadata = typeof firstComment.metadata === 'string'
          ? JSON.parse(firstComment.metadata)
          : firstComment.metadata;
        const screenshot = metadata?.screenshot || null;
        setScreenshotForPage(screenshot);
        hasScreenshot = !!screenshot;
      } else {
        setScreenshotForPage(null);
      }

      // Find thread with HTML snapshot (for DOM rendering)
      const threadWithHtmlSnapshot = pageThreads.find(t => {
        const firstComment = t.comments[0];
        if (!firstComment?.metadata) return false;
        const metadata = typeof firstComment.metadata === 'string'
          ? JSON.parse(firstComment.metadata)
          : firstComment.metadata;
        return metadata && 'htmlSnapshot' in metadata && metadata.htmlSnapshot;
      });

      let hasHtmlSnapshot = false;
      if (threadWithHtmlSnapshot) {
        const firstComment = threadWithHtmlSnapshot.comments[0];
        const metadata = typeof firstComment.metadata === 'string'
          ? JSON.parse(firstComment.metadata)
          : firstComment.metadata;
        const htmlSnapshot = metadata?.htmlSnapshot || null;
        setHtmlSnapshotForPage(htmlSnapshot);
        hasHtmlSnapshot = !!htmlSnapshot;
      } else {
        setHtmlSnapshotForPage(null);
      }

      // Reset iframe failed state when page changes
      setIframeFailed(false);

      // AUTO-SWITCH VIEW MODE: If no screenshot, try alternatives
      if (!hasScreenshot) {
        if (hasHtmlSnapshot) {
          // Prefer DOM view if we have an HTML snapshot
          setViewMode('dom');
        } else {
          // Fall back to live page view
          setViewMode('live');
        }
      } else {
        // We have a screenshot, use screenshot view
        setViewMode('screenshot');
      }
    }
  }, [selectedPageUrl, threads]);

  // Send HTML snapshot to DOM renderer when in DOM mode
  useEffect(() => {
    if (viewMode === 'dom' && htmlSnapshotForPage && domRendererRef.current) {
      const iframe = domRendererRef.current;
      const sendData = () => {
        iframe.contentWindow?.postMessage({
          type: 'RENDER_DOM',
          htmlSnapshot: htmlSnapshotForPage,
          pins: commentPins.map(pin => {
            const thread = threads.find(t => t.id === pin.threadId);
            return {
              ...pin,
              count: thread?.comments.length || 1,
              resolved: thread?.status === 'resolved'
            };
          })
        }, '*');
      };

      // Send after iframe loads
      if (iframe.contentDocument?.readyState === 'complete') {
        sendData();
      } else {
        iframe.addEventListener('load', sendData, { once: true });
      }
    }
  }, [viewMode, htmlSnapshotForPage, commentPins, threads]);

  // Listen for messages from DOM renderer
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'PIN_CLICKED') {
        const thread = threads.find(t => t.id === event.data.threadId);
        if (thread) {
          handleThreadClick(thread);
        }
      }
      if (event.data.type === 'DOM_RENDER_ERROR') {
        console.warn('DOM render error:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [threads]);

  // Handle screenshot resize
  useEffect(() => {
    const updateScreenshotScale = () => {
      if (screenshotRef.current) {
        const img = screenshotRef.current;
        const scale = img.clientWidth / img.naturalWidth;
        setScreenshotScale(scale);
      }
    };

    window.addEventListener('resize', updateScreenshotScale);
    return () => window.removeEventListener('resize', updateScreenshotScale);
  }, []);

  const updateCommentPins = (threadsData: ThreadWithComments[]) => {
    const pins: CommentPin[] = threadsData
      .filter(thread => thread.position_data)
      .map(thread => {
        const pos = typeof thread.position_data === 'string'
          ? JSON.parse(thread.position_data)
          : thread.position_data;

        const scrollX = pos.scrollX || 0;
        const scrollY = pos.scrollY || 0;

        return {
          threadId: thread.id,
          x: (pos.x || 0) - scrollX,
          y: (pos.y || 0) - scrollY,
        };
      });
    setCommentPins(pins);
  };

  const fetchAppDetails = async () => {
    if (!id || !user) return;

    const { data: appData } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (!appData) {
      navigate('/dashboard/apps');
      return;
    }

    setApp(appData);

    // Check if user is the app owner
    if (appData.owner_id === user.id) {
      setCurrentUserAccessLevel('owner');
    } else {
      // Check user's access level from app_collaborators
      const { data: collaboratorData } = await supabase
        .from('app_collaborators')
        .select('access_level')
        .eq('app_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentUserAccessLevel(collaboratorData?.access_level || null);
    }

    const { data: threadsData } = await supabase
      .from('threads')
      .select(`
        *,
        comments(
          *,
          author:profiles!comments_author_id_fkey(full_name, email)
        )
      `)
      .eq('app_id', id)
      .order('created_at', { ascending: false });

    if (threadsData) {
      setThreads(threadsData as any);
    }

    setLoading(false);
  };

  const fetchAppCollaborators = async () => {
    if (!id) return;
    
    setLoadingCollaborators(true);
    try {
      const { data, error } = await supabase
        .from('app_collaborators')
        .select(`
          id,
          user_id,
          access_level,
          invited_by,
          invited_at,
          profile:profiles!app_collaborators_user_id_fkey(full_name, email),
          inviter:profiles!app_collaborators_invited_by_fkey(full_name, email)
        `)
        .eq('app_id', id)
        .order('invited_at', { ascending: true });

      if (error) {
        console.error('Error fetching collaborators:', error);
      } else {
        setAppCollaborators(data as any || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string, collaboratorUserId: string) => {
    if (!confirm('Are you sure you want to remove this member from the app?')) return;

    try {
      const { error } = await supabase
        .from('app_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      setAppCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      alert('Member removed successfully');
    } catch (err: any) {
      alert('Failed to remove member: ' + err.message);
    }
  };

  const handleUpdateCollaboratorRole = async (collaboratorId: string, newRole: string) => {
    // Validate permission
    const assignableRoles = getAssignableAppRoles().map(r => r.value);
    if (!assignableRoles.includes(newRole as any)) {
      alert(`You don't have permission to assign the ${newRole} role.`);
      return;
    }

    try {
      const { error } = await supabase
        .from('app_collaborators')
        .update({ access_level: newRole })
        .eq('id', collaboratorId);

      if (error) throw error;

      setAppCollaborators(prev => 
        prev.map(c => c.id === collaboratorId ? { ...c, access_level: newRole } : c)
      );
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  // Check if user can manage (remove/change role) collaborators
  const canManageCollaborators = (): boolean => {
    return currentUserAccessLevel === 'owner';
  };

  const shareUrl = app
    ? `${window.location.origin}/review/${app.id}`
    : '';

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if user can invite others to this app
  const canInviteToApp = (): boolean => {
    if (!currentUserAccessLevel) return false;
    // Owner can always invite
    if (currentUserAccessLevel === 'owner') return true;
    // Moderator and commenter can invite (but with limited roles)
    return ['moderator', 'commenter'].includes(currentUserAccessLevel);
  };

  // Get available roles that user can assign based on their own access level
  const getAssignableAppRoles = (): { value: 'viewer' | 'commenter' | 'moderator'; label: string }[] => {
    // Owner can assign any role
    if (currentUserAccessLevel === 'owner') {
      return [
        { value: 'viewer', label: 'Viewer - Can only view comments' },
        { value: 'commenter', label: 'Commenter - Can add comments' },
        { value: 'moderator', label: 'Moderator - Can manage comments' },
      ];
    }
    // Moderator and Commenter can only assign viewer or commenter
    if (currentUserAccessLevel === 'moderator' || currentUserAccessLevel === 'commenter') {
      return [
        { value: 'viewer', label: 'Viewer - Can only view comments' },
        { value: 'commenter', label: 'Commenter - Can add comments' },
      ];
    }
    // Viewers cannot invite
    return [];
  };

  const handleInviteTester = async () => {
    if (!inviteEmail || !user || !app || !currentWorkspace) return;

    // Validate that user can assign the selected role
    const assignableRoles = getAssignableAppRoles().map(r => r.value);
    if (!assignableRoles.includes(inviteRole)) {
      alert(`You don't have permission to assign the ${inviteRole} role.`);
      return;
    }

    setSendingInvite(true);
    const normalizedEmail = inviteEmail.toLowerCase().trim();
    
    try {
      console.log('📧 Step 1: Checking if user already exists...');
      
      // Check if user exists by email
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        console.log('✅ User exists, adding directly as collaborator and workspace member...');
        
        // Add to app_collaborators
        const { error: collabError } = await supabase
          .from('app_collaborators')
          .upsert({
            app_id: app.id,
            user_id: existingUser.id,
            access_level: inviteRole,
            invited_by: user.id,
          }, { onConflict: 'app_id,user_id' });

        if (collabError) {
          console.error('❌ Collaborator insert error:', collabError);
          throw new Error(`Failed to add collaborator: ${collabError.message}`);
        }

        // Also add to workspace_members (with viewer role by default for invited users)
        const workspaceRole = inviteRole === 'moderator' ? 'moderator' : 
                             inviteRole === 'viewer' ? 'viewer' : 'commenter';
        
        const { error: workspaceMemberError } = await supabase
          .from('workspace_members')
          .upsert({
            workspace_id: currentWorkspace.id,
            user_id: existingUser.id,
            role: workspaceRole,
            invited_by: user.id,
          }, { onConflict: 'workspace_id,user_id' });

        if (workspaceMemberError) {
          console.warn('⚠️ Could not add to workspace (may already be a member):', workspaceMemberError.message);
        }

        alert('User added successfully! They can now access this app and workspace.');
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('commenter');
        return;
      }

      console.log('📧 User does not exist, creating invitation...');
      
      // Step 2: Create invitation record for new user
      const { data, error } = await supabase
        .from('app_invitations')
        .insert({
          app_id: app.id,
          inviter_id: user.id,
          invitee_email: normalizedEmail,
          access_level: inviteRole,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Invitation created. ID:', data.id);
      console.log('📧 Step 3: Sending invitation email via Edge Function...');

      // Step 3: Send email via Edge Function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('send-app-invitation', {
        body: {
          invitationId: data.id,
          inviteeEmail: normalizedEmail,
          appName: app.name,
          inviterName: user.user_metadata?.full_name || user.email,
          workspaceId: currentWorkspace.id,
          workspaceName: currentWorkspace.name,
        },
      });

      if (functionError) {
        console.error('❌ Edge function error:', functionError);
        alert('Invitation created! Note: Email notification may not have been sent (Edge Function not deployed). Share the app link manually.');
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('commenter');
        return;
      }

      if (!functionData?.success) {
        console.error('❌ Edge function returned error:', functionData);
        alert('Invitation created! Note: Email notification may not have been sent. Share the app link manually.');
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('commenter');
        return;
      }

      console.log('✅ Email sent successfully!');
      alert('Invitation sent successfully! The user will receive an email to sign up and access this app.');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('commenter');
    } catch (error: any) {
      console.error('❌ Error sending invitation:', error);
      alert(`Failed to send invitation: ${error.message || 'Please try again'}`);
    } finally {
      setSendingInvite(false);
    }
  };

  const generateShareToken = async () => {
    if (!app || !user) return;

    setLoadingShareToken(true);
    try {
      const { data, error } = await supabase
        .from('app_access_tokens')
        .select('token')
        .eq('app_id', app.id)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setShareToken(data.token);
      } else {
        const { data: newToken, error: createError } = await supabase
          .from('app_access_tokens')
          .insert({
            app_id: app.id,
            created_by: user.id,
            access_level: 'reviewer',
            is_active: true,
          })
          .select('token')
          .single();

        if (createError) throw createError;
        setShareToken(newToken.token);
      }
    } catch (error) {
      console.error('Error generating share token:', error);
      alert('Failed to generate share link. Please try again.');
    } finally {
      setLoadingShareToken(false);
    }
  };

  const copyShareToken = () => {
    if (!shareToken) return;
    const shareUrl = `${window.location.origin}/review/${app?.id}?token=${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowShareModal = () => {
    setShowShareModal(true);
    if (!shareToken) {
      generateShareToken();
    }
  };

  const handleThreadClick = (thread: ThreadWithComments) => {
    setSelectedThread(thread);
    setShowCommentOverlay(true);
  };

  const closeCommentOverlay = () => {
    setShowCommentOverlay(false);
    setTimeout(() => setSelectedThread(null), 300);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploadingFiles(true);
    try {
      const uploadedFiles: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const attachment = await uploadAttachment(file, user.id);
        if (attachment) {
          uploadedFiles.push(attachment);
        }
      }

      setAttachments([...attachments, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
  };

  const handleSendReply = async () => {
    if ((!replyText.trim() && attachments.length === 0) || !selectedThread || !user) return;

    try {
      const { error } = await supabase.from('comments').insert({
        thread_id: selectedThread.id,
        author_id: user.id,
        content: replyText || '(Attachment)',
        attachments: attachments,
      });

      if (error) throw error;

      setReplyText('');
      setAttachments([]);
      await fetchAppDetails();

      const { data: updatedThread } = await supabase
        .from('threads')
        .select(`
          *,
          comments(
            *,
            author:profiles!comments_author_id_fkey(full_name, email)
          )
        `)
        .eq('id', selectedThread.id)
        .single();

      if (updatedThread) {
        setSelectedThread(updatedThread as any);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleToggleResolve = async (thread: ThreadWithComments) => {
    try {
      const newStatus = thread.status === 'resolved' ? 'open' : 'resolved';
      const { error } = await supabase
        .from('threads')
        .update({ status: newStatus })
        .eq('id', thread.id);

      if (error) throw error;

      await fetchAppDetails();
      if (selectedThread?.id === thread.id) {
        setSelectedThread({ ...thread, status: newStatus });
      }
    } catch (error) {
      console.error('Error toggling thread status:', error);
    }
  };

  const handleDeleteThread = async () => {
    if (!deletingThread) return;

    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', deletingThread.id);

      if (error) throw error;

      await fetchAppDetails();
      if (selectedThread?.id === deletingThread.id) {
        setShowCommentOverlay(false);
        setSelectedThread(null);
      }
      setShowDeleteModal(false);
      setDeletingThread(null);
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleEditComment = (comment: Comment & { author: any }) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
    setCommentMenuOpen(null);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editText,
          edited_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      await fetchAppDetails();
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string, threadId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      const { data: remainingComments } = await supabase
        .from('comments')
        .select('id')
        .eq('thread_id', threadId);

      if (!remainingComments || remainingComments.length === 0) {
        await supabase
          .from('threads')
          .delete()
          .eq('id', threadId);

        setShowCommentOverlay(false);
        setSelectedThread(null);
      }

      await fetchAppDetails();
      setCommentMenuOpen(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleSyncToJira = async (thread: ThreadWithComments) => {
    if (!currentWorkspace?.id) {
      alert('No workspace selected');
      return;
    }

    setSyncingToJira(true);

    try {
      const result = await syncThreadToJira(currentWorkspace.id, thread.id);

      if (result.success && result.issueKey) {
        setJiraSyncStatus({ threadId: thread.id, issueKey: result.issueKey });
        alert(`Successfully synced to Jira: ${result.issueKey}`);
      } else {
        alert(`Failed to sync: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error syncing to Jira:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSyncingToJira(false);
    }
  };

  const getAuthorInitials = (author: { full_name: string | null; email: string }) => {
    return author.full_name?.[0] || author.email[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!app) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="flex items-center justify-between px-6 py-2 bg-white/5 backdrop-blur-xl border-b border-white/10 flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/apps')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Apps</span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <h1 className="text-base font-semibold text-white">{app.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchAppCollaborators();
              setShowMembersModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md text-slate-200 rounded-lg hover:bg-white/20 transition text-sm border border-white/10"
          >
            <Users className="w-4 h-4" />
            <span>Members{appCollaborators.length > 0 ? ` (${appCollaborators.length + 1})` : ''}</span>
          </button>

          {canInviteToApp() && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md text-slate-200 rounded-lg hover:bg-white/20 transition text-sm border border-white/10"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite</span>
          </button>
          )}

          <button
            onClick={handleShowShareModal}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 backdrop-blur-md text-blue-100 rounded-lg hover:bg-blue-500/40 transition text-sm border border-blue-400/30"
          >
            <Share2 className="w-4 h-4" />
            <span>Share URL</span>
          </button>
        </div>
      </header>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Invite Tester</h3>
                  <p className="text-sm text-slate-400">Send review invitation</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Show permission info for non-owner users */}
              {currentUserAccessLevel && currentUserAccessLevel !== 'owner' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-xs text-amber-300 leading-relaxed">
                    As a {currentUserAccessLevel}, you can only invite members as Viewer or Commenter.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="tester@example.com"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Access Level
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getAssignableAppRoles().map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  The recipient will receive an email invitation to review this app. They will also be added to the workspace.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowInviteModal(false)}
                disabled={sendingInvite}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteTester}
                disabled={!inviteEmail || sendingInvite}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingInvite ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Send Invitation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">App Members</h3>
                  <p className="text-sm text-slate-400">People who have access to this app</p>
                </div>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingCollaborators ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* App Owner */}
                  {app && (
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {user?.id === app.owner_id ? 'You (Owner)' : 'App Owner'}
                          </p>
                          <p className="text-xs text-slate-400">Full access</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full font-medium">
                        Owner
                      </span>
                    </div>
                  )}

                  {/* Collaborators */}
                  {appCollaborators.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No other members yet. Invite someone to collaborate!
                    </div>
                  ) : (
                    appCollaborators.map((collab) => {
                      const isCurrentUser = collab.user_id === user?.id;
                      const canManage = canManageCollaborators() && !isCurrentUser;

                      return (
                        <div
                          key={collab.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 font-medium text-sm">
                                {collab.profile?.full_name?.charAt(0).toUpperCase() || 
                                 collab.profile?.email?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">
                                {collab.profile?.full_name || collab.profile?.email || 'Unknown'}
                                {isCurrentUser && <span className="text-slate-400 ml-1">(You)</span>}
                              </p>
                              <p className="text-xs text-slate-400">
                                {collab.profile?.email}
                                {collab.inviter && (
                                  <span className="ml-2">
                                    • Invited by {collab.inviter.full_name || collab.inviter.email}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canManage ? (
                              <>
                                <select
                                  value={collab.access_level}
                                  onChange={(e) => handleUpdateCollaboratorRole(collab.id, e.target.value)}
                                  className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {getAssignableAppRoles().map(role => (
                                    <option key={role.value} value={role.value}>
                                      {role.value.charAt(0).toUpperCase() + role.value.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleRemoveCollaborator(collab.id, collab.user_id)}
                                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition"
                                  title="Remove member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                collab.access_level === 'moderator' 
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : collab.access_level === 'commenter'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}>
                                {collab.access_level.charAt(0).toUpperCase() + collab.access_level.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowMembersModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
              >
                Close
              </button>
              {canInviteToApp() && (
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setShowInviteModal(true);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Member
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Share Review Link</h3>
                  <p className="text-sm text-slate-400">Public access URL</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {loadingShareToken ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : shareToken ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Shareable Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/review/${app?.id}?token=${shareToken}`}
                        readOnly
                        className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={copyShareToken}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Copied</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">How it works</h4>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>Anyone with this link can review your app</li>
                      <li>Testers can browse and leave feedback</li>
                      <li>Link remains active until you deactivate it</li>
                      <li>Perfect for external testers or clients</li>
                    </ul>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-1">Public Access</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          This link allows public access to review your app. Share it carefully.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">Failed to generate share link</p>
                  <button
                    onClick={generateShareToken}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 bg-slate-900 overflow-hidden flex flex-col">
          {threads.length > 0 && (
            <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-3 flex items-center gap-3 overflow-x-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap font-medium">Pages:</span>
              {Array.from(new Set(threads.map(t => t.page_url))).map((pageUrl) => {
                const pageThreads = threads.filter(t => t.page_url === pageUrl);
                const url = new URL(pageUrl);
                const displayPath = url.pathname === '/' ? url.hostname : url.pathname;
                const pageTitle = pageThreads[0]?.comments[0]?.metadata
                  ? (typeof pageThreads[0].comments[0].metadata === 'string'
                      ? JSON.parse(pageThreads[0].comments[0].metadata).page_title
                      : pageThreads[0].comments[0].metadata.page_title)
                  : null;

                return (
                  <button
                    key={pageUrl}
                    onClick={() => setSelectedPageUrl(pageUrl)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center gap-2 ${
                      selectedPageUrl === pageUrl
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title={pageUrl}
                  >
                    <span>{pageTitle || displayPath}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      selectedPageUrl === pageUrl
                        ? 'bg-white/20'
                        : 'bg-slate-600'
                    }`}>
                      {pageThreads.length}
                    </span>
                  </button>
                );
              })}
              
              {/* View Mode Toggle */}
              <div className="ml-auto flex items-center gap-2 border-l border-slate-600 pl-4">
                <span className="text-xs text-slate-400">View:</span>
                <div className="flex bg-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('screenshot')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      viewMode === 'screenshot'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="View captured screenshot"
                  >
                    📸 Screenshot
                  </button>
                  <button
                    onClick={() => setViewMode('live')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      viewMode === 'live'
                        ? 'bg-green-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    } ${iframeFailed ? 'line-through opacity-50' : ''}`}
                    title={iframeFailed ? 'Live view blocked by site' : 'View live page (may be blocked by some sites)'}
                  >
                    🌐 Live
                  </button>
                  {htmlSnapshotForPage && (
                    <button
                      onClick={() => setViewMode('dom')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        viewMode === 'dom'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                      title="View captured DOM snapshot (works when live view is blocked)"
                    >
                      📄 DOM
                    </button>
                  )}
                </div>
                {(viewMode === 'live' || viewMode === 'dom') && selectedPageUrl && (
                  <a
                    href={selectedPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-300" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto relative bg-slate-900">
            {threads.length > 0 && selectedPageUrl ? (
              viewMode === 'dom' && htmlSnapshotForPage ? (
                /* DOM Snapshot View - Works when live iframe is blocked */
                <div className="relative w-full h-full">
                  <iframe
                    ref={domRendererRef}
                    src="/dom-renderer.html"
                    className="w-full h-full border-0"
                    title="DOM snapshot preview"
                  />
                  
                  {/* Info banner for DOM mode */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 text-lg">📄</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">DOM Snapshot View</p>
                      <p className="text-xs text-slate-400">Captured HTML snapshot. Interactive elements are disabled. Click pins to view comments.</p>
                    </div>
                    <a
                      href={selectedPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Live Page
                    </a>
                  </div>
                </div>
              ) : viewMode === 'live' ? (
                /* Live Page View with Iframe */
                <div className="relative w-full h-full">
                  <iframe
                    ref={iframeRef}
                    src={selectedPageUrl}
                    className="w-full h-full border-0"
                    title="Live page preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={() => setIframeFailed(true)}
                  />
                  
                  {/* Comment pins overlay on iframe */}
                  <div className="absolute inset-0 pointer-events-none">
                    {commentPins.map((pin) => {
                      const thread = threads.find(t => t.id === pin.threadId);
                      if (!thread) return null;
                      const isSelected = selectedThread?.id === thread.id && showCommentOverlay;

                      return (
                        <button
                          key={pin.threadId}
                          onClick={() => handleThreadClick(thread)}
                          className={`pointer-events-auto absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl transition-all hover:scale-110 border-2 border-white ${
                            isSelected
                              ? 'bg-blue-600 scale-110 ring-4 ring-blue-300'
                              : thread.status === 'resolved'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                          style={{
                            left: `${pin.x}px`,
                            top: `${pin.y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={`${thread.comments.length} comment${thread.comments.length !== 1 ? 's' : ''} - ${thread.status}`}
                        >
                          {thread.comments.length}
                        </button>
                      );
                    })}
                  </div>

                  {/* Info banner for live mode */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-lg">🌐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Live Page Preview</p>
                      <p className="text-xs text-slate-400">
                        {iframeFailed 
                          ? 'This site blocks iframe embedding. Try DOM Snapshot view instead.'
                          : 'Comments are pinned to their original positions. Some sites may block iframe embedding.'
                        }
                      </p>
                    </div>
                    {iframeFailed && htmlSnapshotForPage ? (
                      <button
                        onClick={() => setViewMode('dom')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                      >
                        📄 Try DOM View
                      </button>
                    ) : (
                      <a
                        href={selectedPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Full Page
                      </a>
                    )}
                  </div>
                </div>
              ) : screenshotForPage ? (
                /* Screenshot View */
                <div className="relative inline-block min-w-full">
                  <img
                    ref={screenshotRef}
                    src={screenshotForPage}
                    alt="Page screenshot"
                    className="w-full h-auto shadow-2xl"
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const scale = img.clientWidth / img.naturalWidth;
                      setScreenshotScale(scale);
                      console.log('📸 Screenshot scale:', scale, 'Display:', img.clientWidth, 'Natural:', img.naturalWidth);
                    }}
                  />

                  {commentPins.map((pin) => {
                    const thread = threads.find(t => t.id === pin.threadId);
                    if (!thread) return null;
                    const isSelected = selectedThread?.id === thread.id && showCommentOverlay;

                    return (
                      <button
                        key={pin.threadId}
                        onClick={() => handleThreadClick(thread)}
                        className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl transition-all hover:scale-110 border-2 border-white ${
                          isSelected
                            ? 'bg-blue-600 scale-110 ring-4 ring-blue-300'
                            : thread.status === 'resolved'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{
                          left: `${pin.x * screenshotScale}px`,
                          top: `${pin.y * screenshotScale}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${thread.comments.length} comment${thread.comments.length !== 1 ? 's' : ''} - ${thread.status}`}
                      >
                        {thread.comments.length}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* No Screenshot - Show Live Page Iframe */
                <div className="relative w-full h-full">
                  <iframe
                    ref={iframeRef}
                    src={selectedPageUrl}
                    className="w-full h-full border-0"
                    title="Live page preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onError={() => setIframeFailed(true)}
                  />

                  {/* Overlay comment pins on iframe */}
                  {commentPins.map((pin) => {
                    const thread = threads.find(t => t.id === pin.threadId);
                    if (!thread) return null;
                    const isSelected = selectedThread?.id === thread.id && showCommentOverlay;

                    return (
                      <button
                        key={pin.threadId}
                        onClick={() => handleThreadClick(thread)}
                        className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl transition-all hover:scale-110 border-2 border-white pointer-events-auto ${
                          isSelected
                            ? 'bg-blue-600 scale-110 ring-4 ring-blue-300'
                            : thread.status === 'resolved'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{
                          left: `${pin.x}px`,
                          top: `${pin.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10
                        }}
                        title={`${thread.comments.length} comment${thread.comments.length !== 1 ? 's' : ''} - ${thread.status}`}
                      >
                        {thread.comments.length}
                      </button>
                    );
                  })}

                  {/* Info banner for fallback live mode */}
                  <div className="absolute bottom-4 left-4 right-4 bg-amber-900/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 text-lg">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-200">Older Comment - No Screenshot</p>
                      <p className="text-xs text-amber-300/80">This comment was made before screenshot capture was enabled. Showing live page instead.</p>
                    </div>
                    <a
                      href={selectedPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Page
                    </a>
                  </div>
                </div>
              )
            ) : (
              /* No Feedback Yet */
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center max-w-md px-4">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-blue-500/50" />
                  </div>
                  <p className="text-xl font-semibold text-slate-300 mb-3">No Feedback Yet</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Share the review URL with your testers to start collecting feedback. Comments will appear here with screenshots showing exactly where issues were found.
                  </p>
                </div>
              </div>
            )}
          </div>

          {showCommentOverlay && selectedThread && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
                    <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedThread.status === 'resolved' ? 'bg-green-500' : 'bg-amber-500'
                          }`} />
                          <div>
                            <h3 className="text-lg font-semibold text-white">Comment Thread</h3>
                            <p className="text-xs text-slate-400 truncate max-w-md">
                              {selectedThread.page_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSyncToJira(selectedThread)}
                            disabled={syncingToJira}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Sync to Jira"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingToJira ? 'animate-spin' : ''}`} />
                            {syncingToJira ? 'Syncing...' : 'Sync to Jira'}
                          </button>
                          <button
                            onClick={() => handleToggleResolve(selectedThread)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                              selectedThread.status === 'resolved'
                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            }`}
                            title={selectedThread.status === 'resolved' ? 'Reopen thread' : 'Mark as resolved'}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {selectedThread.status === 'resolved' ? 'Resolved' : 'Open'}
                          </button>
                          <button
                            onClick={() => {
                              setDeletingThread(selectedThread);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                            title="Delete thread"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={closeCommentOverlay}
                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                          >
                            <X className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {selectedThread.comments.map((comment, index) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-sm font-semibold text-white">
                                {getAuthorInitials(comment.author)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-slate-700 rounded-2xl p-4 shadow-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {comment.author.full_name || comment.author.email}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {new Date(comment.created_at).toLocaleString()}
                                      {comment.edited_at && ' (edited)'}
                                    </p>
                                  </div>
                                  {comment.author_id === user?.id && (
                                    <div className="relative">
                                      <button
                                        onClick={() => setCommentMenuOpen(commentMenuOpen === comment.id ? null : comment.id)}
                                        className="p-1 hover:bg-slate-600 rounded transition"
                                      >
                                        <MoreVertical className="w-4 h-4 text-slate-400" />
                                      </button>
                                      {commentMenuOpen === comment.id && (
                                        <div className="absolute right-0 mt-1 w-32 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-50">
                                          <button
                                            onClick={() => handleEditComment(comment)}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteComment(comment.id, comment.thread_id)}
                                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {editingComment === comment.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full bg-slate-600 text-slate-200 rounded-lg p-2 text-sm border border-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                                      rows={3}
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSaveEdit(comment.id)}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg flex items-center gap-1.5 transition"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingComment(null);
                                          setEditText('');
                                        }}
                                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-300 text-xs rounded-lg transition"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-200 leading-relaxed">
                                    {comment.content}
                                  </p>
                                )}
                                {comment.attachments && Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                                    {(comment.attachments as Attachment[]).map((attachment, idx) => (
                                      <div key={idx} className="flex items-center gap-2 bg-slate-600/50 rounded-lg p-2">
                                        {isImageFile(attachment.type) ? (
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1"
                                          >
                                            <img
                                              src={attachment.url}
                                              alt={attachment.name}
                                              className="max-w-full max-h-48 rounded"
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 flex-1 hover:bg-slate-600 p-2 rounded transition"
                                          >
                                            <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs text-slate-200 truncate">{attachment.name}</p>
                                              <p className="text-xs text-slate-400">{formatFileSize(attachment.size)}</p>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-400" />
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-slate-700 bg-slate-750">
                        {attachments.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center gap-2 bg-slate-700 rounded-lg p-2 text-xs">
                                <span>{getFileIcon(attachment.type)}</span>
                                <span className="text-slate-300 truncate max-w-[120px]">{attachment.name}</span>
                                <button
                                  onClick={() => handleRemoveAttachment(attachment.id)}
                                  className="text-slate-400 hover:text-red-400 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !uploadingFiles) {
                                  e.preventDefault();
                                  handleSendReply();
                                }
                              }}
                              placeholder="Write a reply..."
                              className="w-full px-4 py-3 bg-slate-700 text-slate-200 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,video/mp4,video/quicktime"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingFiles}
                            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition disabled:opacity-50"
                            title="Attach files"
                          >
                            <Paperclip className="w-5 h-5 text-slate-400" />
                          </button>
                          <button
                            onClick={handleSendReply}
                            disabled={(!replyText.trim() && attachments.length === 0) || uploadingFiles}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition flex items-center gap-2"
                          >
                            <Send className="w-5 h-5 text-white" />
                            <span className="text-sm font-medium text-white">{uploadingFiles ? 'Uploading...' : 'Send'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
        </div>

        <div className={`absolute top-0 right-0 bottom-0 bg-slate-800 border-l border-slate-700 flex flex-col transition-all duration-300 shadow-2xl ${
          isCommentsSidebarCollapsed ? 'w-14' : 'w-96'
        }`}>
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
            {!isCommentsSidebarCollapsed && (
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
                <span className="ml-auto text-xs font-normal text-slate-400">
                  {threads.length}
                </span>
              </h2>
            )}
            <button
              onClick={() => setIsCommentsSidebarCollapsed(!isCommentsSidebarCollapsed)}
              className={`p-1 hover:bg-slate-700 rounded transition ${
                isCommentsSidebarCollapsed ? 'mx-auto' : ''
              }`}
              title={isCommentsSidebarCollapsed ? 'Expand comments' : 'Collapse comments'}
            >
              {isCommentsSidebarCollapsed ? (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {!isCommentsSidebarCollapsed && (
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center px-4">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Share the URL with testers to collect feedback
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {threads.map((thread) => {
                    const latestComment = thread.comments[thread.comments.length - 1];
                    return (
                      <button
                        key={thread.id}
                        onClick={() => handleThreadClick(thread)}
                        className="w-full text-left p-4 hover:bg-slate-700/50 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-xs font-semibold text-white">
                              {getAuthorInitials(latestComment.author)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white truncate">
                                {latestComment.author.full_name || latestComment.author.email.split('@')[0]}
                              </span>
                              <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                thread.status === 'resolved'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {thread.status === 'resolved' ? 'Resolved' : 'Open'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                              {latestComment.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{thread.comments.length} comment{thread.comments.length !== 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{new Date(latestComment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && deletingThread && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Thread</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete this thread and all its comments? This will permanently remove all feedback from this location.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingThread(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteThread}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
