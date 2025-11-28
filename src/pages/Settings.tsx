import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { supabase } from '../lib/supabase';
import { User, Building2, Plug, CheckCircle, XCircle, Loader, ExternalLink, CreditCard, Crown, AlertTriangle } from 'lucide-react';
import { JiraService, createOrUpdateJiraConfig, getJiraConfig } from '../lib/jira';

export function Settings() {
  const { } = useAuth();
  const { } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'integrations' | 'billing'>('profile');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and workspace settings</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'workspace'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Workspace</span>
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plug className="w-4 h-4" />
          <span>Integrations</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'billing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Billing</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'workspace' && <WorkspaceSettings />}
        {activeTab === 'integrations' && <IntegrationSettings />}
        {activeTab === 'billing' && <BillingSettings />}
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Your full name"
            />
          </div>

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Profile updated successfully
            </div>
          )}

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  const { currentWorkspace, currentMembership } = useWorkspace();

  if (!currentWorkspace) return null;

  const isAdmin = currentMembership?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Workspace Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
            <input
              type="text"
              value={currentWorkspace.name}
              disabled={!isAdmin}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            {!isAdmin && (
              <p className="mt-1 text-xs text-slate-500">Only admins can update workspace settings</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Workspace URL</label>
            <input
              type="text"
              value={currentWorkspace.slug}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">Workspace URL cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Role</label>
            <input
              type="text"
              value={currentMembership?.role || 'Unknown'}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 capitalize"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptionInfo();
    }
  }, [user]);

  const loadSubscriptionInfo = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscription_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setSubscriptionInfo(data);
      }
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const limits = subscriptionInfo?.limits || {};
  const isExpired = subscriptionInfo?.is_expired || false;
  const isPro = subscriptionInfo?.subscription_plan === 'pro';
  const isTrial = subscriptionInfo?.subscription_status === 'trial';
  const trialDaysRemaining = subscriptionInfo?.trial_days_remaining || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Subscription & Billing</h2>

        {isExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Trial Expired</h3>
              <p className="text-sm text-red-700 mt-1">
                Your trial has ended. Upgrade to Pro to continue creating apps and comments.
              </p>
            </div>
          </div>
        )}

        {isTrial && !isExpired && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Trial Period</h3>
              <p className="text-sm text-blue-700 mt-1">
                You have {Math.ceil(trialDaysRemaining)} days remaining in your free trial.
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                {isPro && <Crown className="w-5 h-5 text-yellow-500" />}
                {subscriptionInfo?.subscription_plan?.toUpperCase() || 'FREE'} Plan
              </h3>
              <p className="text-sm text-slate-600 mt-1 capitalize">
                Status: {subscriptionInfo?.subscription_status || 'Active'}
              </p>
            </div>
            {!isPro && (
              <button className="bg-gradient-to-r from-[#5941F2] to-[#F2AEEE] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-[#5941F2]/30 transition-all hover:scale-105">
                Upgrade to Pro
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Apps</div>
              <div className="text-2xl font-bold text-slate-900">
                {limits.max_apps === -1 ? 'Unlimited' : limits.max_apps || 0}
              </div>
              {!limits.can_create_apps && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Cannot create
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Comments/Month</div>
              <div className="text-2xl font-bold text-slate-900">
                {limits.max_comments_per_month === -1 ? 'Unlimited' : limits.max_comments_per_month || 0}
              </div>
              {!limits.can_create_comments && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Cannot create
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Team Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {limits.max_team_members === -1 ? 'Unlimited' : limits.max_team_members || 0}
              </div>
              {!limits.can_invite_members && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Cannot invite
                </div>
              )}
            </div>
          </div>
        </div>

        {!isPro && (
          <div className="mt-8 bg-gradient-to-br from-[#5941F2] via-[#F2AEEE] to-[#F2B035] rounded-xl p-8 text-white">
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
                <p className="text-white/90 mb-4">
                  Get unlimited apps, comments, and team members. No limits, no restrictions.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Unlimited apps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Unlimited comments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Jira, Notion, GitHub sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <button className="bg-white text-[#5941F2] px-8 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-lg">
                  Upgrade Now - $49/month
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const { currentWorkspace } = useWorkspace();
  const [jiraDomain, setJiraDomain] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadExistingConfig();
    }
  }, [currentWorkspace?.id]);

  const loadExistingConfig = async () => {
    if (!currentWorkspace?.id) return;

    const config = await getJiraConfig(currentWorkspace.id);
    if (config) {
      setJiraDomain(config.jira_domain || '');
      setJiraEmail(config.jira_email || '');
      setJiraProjectKey(config.jira_project_key || '');
      setAutoSync(config.auto_sync_enabled || false);
      setIsConfigured(true);
      setConnectionStatus('success');
    }
  };

  const handleTestConnection = async () => {
    if (!jiraDomain || !jiraEmail || !jiraApiToken) {
      setErrorMessage('Please fill in all required fields');
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setErrorMessage('');
    setConnectionStatus('idle');

    try {
      const jiraService = new JiraService({
        domain: jiraDomain,
        email: jiraEmail,
        apiToken: jiraApiToken,
        projectKey: jiraProjectKey
      });

      const isConnected = await jiraService.testConnection();

      if (isConnected) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage('Unable to connect. Please check your credentials.');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!currentWorkspace?.id) return;

    if (!jiraDomain || !jiraEmail || !jiraApiToken || !jiraProjectKey) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await createOrUpdateJiraConfig(
        currentWorkspace.id,
        {
          domain: jiraDomain,
          email: jiraEmail,
          apiToken: jiraApiToken,
          projectKey: jiraProjectKey
        },
        autoSync
      );

      setIsConfigured(true);
      alert('Jira integration configured successfully!');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Jira Integration</h2>
        <p className="text-slate-600 mb-6">
          Connect to your Jira instance to sync feedback directly to your project management workflow.
          <a
            href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 ml-1 inline-flex items-center gap-1"
          >
            Learn how to create an API token
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>

        {isConfigured && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm w-fit">
            <CheckCircle className="w-4 h-4" />
            <span>Jira integration is configured and active</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="jiraDomain" className="block text-sm font-medium text-slate-700 mb-1">
              Jira Domain *
            </label>
            <input
              type="text"
              id="jiraDomain"
              value={jiraDomain}
              onChange={(e) => setJiraDomain(e.target.value)}
              placeholder="yourcompany.atlassian.net"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your Jira instance domain without https://
            </p>
          </div>

          <div>
            <label htmlFor="jiraEmail" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="jiraEmail"
              value={jiraEmail}
              onChange={(e) => setJiraEmail(e.target.value)}
              placeholder="your.email@company.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your Atlassian account email
            </p>
          </div>

          <div>
            <label htmlFor="jiraApiToken" className="block text-sm font-medium text-slate-700 mb-1">
              API Token *
            </label>
            <input
              type="password"
              id="jiraApiToken"
              value={jiraApiToken}
              onChange={(e) => setJiraApiToken(e.target.value)}
              placeholder="Your Jira API token"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Create an API token from your Atlassian account settings
            </p>
          </div>

          <div>
            <label htmlFor="jiraProjectKey" className="block text-sm font-medium text-slate-700 mb-1">
              Default Project Key *
            </label>
            <input
              type="text"
              id="jiraProjectKey"
              value={jiraProjectKey}
              onChange={(e) => setJiraProjectKey(e.target.value.toUpperCase())}
              placeholder="PROJ"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              The project key where issues will be created (e.g., PROJ, DEMO)
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTestingConnection ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Connection successful</span>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="text-sm">Connection failed</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Sync Options</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-slate-900">Auto-sync threads to Jira</div>
              <p className="text-sm text-slate-600 mt-1">
                Automatically create Jira issues when new comment threads are created. You can also manually sync individual threads.
              </p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || connectionStatus !== 'success'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
