const SUPABASE_URL = window.SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;

let currentUser = null;
let apps = [];

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();

  // Login handlers
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('goto-page-btn').addEventListener('click', handleGotoPage);
  document.getElementById('start-btn').addEventListener('click', handleStartRecording);
  document.getElementById('stop-btn').addEventListener('click', handleStopRecording);
  document.getElementById('open-dashboard').addEventListener('click', openDashboard);

  // Signup handlers
  document.getElementById('signup-btn').addEventListener('click', handleSignup);
  document.getElementById('show-signup').addEventListener('click', showSignupSection);
  document.getElementById('show-login').addEventListener('click', showLoginSection);

  // Login form keyboard handlers
  document.getElementById('email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Signup form keyboard handlers
  document.getElementById('signup-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('signup-email').focus();
  });
  document.getElementById('signup-email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('signup-password').focus();
  });
  document.getElementById('signup-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('signup-confirm-password').focus();
  });
  document.getElementById('signup-confirm-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSignup();
  });

  chrome.tabs.onActivated.addListener(() => {
    checkIfOnCorrectPage();
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      checkIfOnCorrectPage();
    }
  });
});

async function checkAuthStatus() {
  const result = await chrome.storage.local.get(['authToken', 'userId', 'userEmail']);

  if (result.authToken && result.userId) {
    currentUser = { id: result.userId, email: result.userEmail };
    await chrome.storage.local.set({ supabaseUrl: SUPABASE_URL });
    showAppSection();
    await loadApps();
    await checkActiveSession();
  } else {
    showLoginSection();
  }
}

async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError('Please enter email and password');
    return;
  }

  hideError();
  setLoading(true);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Login failed');
    }

    await chrome.storage.local.set({
      authToken: data.access_token,
      userId: data.user.id,
      userEmail: data.user.email,
      supabaseUrl: SUPABASE_URL
    });

    currentUser = { id: data.user.id, email: data.user.email };
    showAppSection();
    await loadApps();
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

async function handleLogout() {
  await chrome.storage.local.clear();
  currentUser = null;
  apps = [];
  showLoginSection();
}

async function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  // Validation
  if (!name) {
    showSignupError('Please enter your name');
    return;
  }
  if (!email) {
    showSignupError('Please enter your email');
    return;
  }
  if (!password) {
    showSignupError('Please enter a password');
    return;
  }
  if (password.length < 6) {
    showSignupError('Password must be at least 6 characters');
    return;
  }
  if (password !== confirmPassword) {
    showSignupError('Passwords do not match');
    return;
  }

  hideSignupError();
  setSignupLoading(true);

  try {
    // Call Supabase signup endpoint
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: name
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || data.msg || 'Signup failed');
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      showSignupSuccess('Account created! Please check your email to verify your account before signing in.');
      // Clear form
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('signup-confirm-password').value = '';
    } else if (data.access_token) {
      // Auto-login (email confirmation disabled)
      await chrome.storage.local.set({
        authToken: data.access_token,
        userId: data.user.id,
        userEmail: data.user.email,
        supabaseUrl: SUPABASE_URL
      });

      currentUser = { id: data.user.id, email: data.user.email };
      showAppSection();
      await loadApps();
    } else {
      // Fallback: show success and redirect to login
      showSignupSuccess('Account created! You can now sign in.');
    }
  } catch (error) {
    showSignupError(error.message);
  } finally {
    setSignupLoading(false);
  }
}

function showSignupError(message) {
  const errorDiv = document.getElementById('signup-error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  document.getElementById('signup-success-message').classList.add('hidden');
}

function hideSignupError() {
  document.getElementById('signup-error-message').classList.add('hidden');
}

function showSignupSuccess(message) {
  const successDiv = document.getElementById('signup-success-message');
  successDiv.textContent = message;
  successDiv.classList.remove('hidden');
  document.getElementById('signup-error-message').classList.add('hidden');
}

function setSignupLoading(loading) {
  const btn = document.getElementById('signup-btn');
  btn.disabled = loading;
  btn.textContent = loading ? 'Creating Account...' : 'Create Account';
}

function showSignupSection(e) {
  if (e) e.preventDefault();
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('signup-section').classList.remove('hidden');
  document.getElementById('app-section').classList.add('hidden');
  // Clear any previous errors/success messages
  hideError();
  hideSignupError();
  document.getElementById('signup-success-message').classList.add('hidden');
}

async function loadApps() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userId']);
    console.log('🔍 Echo: Loading apps for user:', result.userId);

    // Exactly match the web app's approach
    // 1. Get all workspaces where user is a member
    const { data: memberships, error: memberError } = await supabaseQuery(
      `/rest/v1/workspace_members?user_id=eq.${result.userId}&select=workspace_id,role,invited_by`,
      result.authToken
    );

    if (memberError) {
      console.error('❌ Echo: Failed to load workspace memberships:', memberError);
      throw new Error('Failed to load workspace memberships');
    }

    console.log('📁 Echo: Found memberships:', memberships.length);

    if (!memberships || memberships.length === 0) {
      const select = document.getElementById('app-select');
      select.innerHTML = '<option value="">No apps available. Create one in the dashboard!</option>';
      return;
    }

    const workspaceIds = memberships.map(m => m.workspace_id);

    // 2. Get all workspaces
    const { data: allWorkspaces, error: wsError } = await supabaseQuery(
      `/rest/v1/workspaces?id=in.(${workspaceIds.join(',')})&select=id,name,owner_id`,
      result.authToken
    );

    if (wsError) {
      console.error('❌ Echo: Failed to load workspaces:', wsError);
      throw new Error('Failed to load workspaces');
    }

    console.log('📁 Echo: Found workspaces:', allWorkspaces.length);

    // 3. Separate into "My Workspaces" (owner) and "Shared Workspaces" (member)
    const myWorkspaceIds = allWorkspaces
      .filter(w => w.owner_id === result.userId)
      .map(w => w.id);
    
    const sharedWorkspaceIds = allWorkspaces
      .filter(w => w.owner_id !== result.userId)
      .map(w => w.id);

    console.log('📁 Echo: My workspaces:', myWorkspaceIds.length);
    console.log('🔗 Echo: Shared workspaces:', sharedWorkspaceIds.length);

    // 4. Load apps from my workspaces
    let myApps = [];
    if (myWorkspaceIds.length > 0) {
      const { data: myAppsData, error: myAppsError } = await supabaseQuery(
        `/rest/v1/apps?workspace_id=in.(${myWorkspaceIds.join(',')})&is_active=eq.true&select=*`,
        result.authToken
      );

      if (!myAppsError && myAppsData) {
        myApps = myAppsData.map(app => ({ ...app, _isOwned: true }));
        console.log('📁 Echo: My apps loaded:', myApps.length);
      }
    }

    // 5. Load apps from shared workspaces
    let sharedApps = [];
    if (sharedWorkspaceIds.length > 0) {
      const { data: sharedAppsData, error: sharedAppsError } = await supabaseQuery(
        `/rest/v1/apps?workspace_id=in.(${sharedWorkspaceIds.join(',')})&is_active=eq.true&select=*`,
        result.authToken
      );

      if (!sharedAppsError && sharedAppsData) {
        sharedApps = sharedAppsData.map(app => ({ ...app, _isOwned: false }));
        console.log('🔗 Echo: Shared apps loaded:', sharedApps.length);
      }
    }

    // 6. Combine all apps
    apps = [...myApps, ...sharedApps];

    // Store apps in chrome.storage for auto-detection by content script
    await chrome.storage.local.set({ userApps: apps });
    console.log('📱 Echo: Total apps stored:', apps.length);

    // 7. Populate dropdown
    const select = document.getElementById('app-select');
    if (apps.length === 0) {
      select.innerHTML = '<option value="">No apps available</option>';
      updateAppInfo(null);
      return;
    }

    select.innerHTML = '<option value="">-- Select an app --</option>';

    // Add "My Apps" group
    if (myApps.length > 0) {
      const myGroup = document.createElement('optgroup');
      myGroup.label = '📁 My Apps';
      myApps.forEach(app => {
        const option = document.createElement('option');
        option.value = app.id;
        const domain = extractDomain(app.base_url);
        option.textContent = `${app.name} (${domain || app.base_url})`;
        option.dataset.baseUrl = app.base_url;
        myGroup.appendChild(option);
      });
      select.appendChild(myGroup);
    }

    // Add "Shared with Me" group
    if (sharedApps.length > 0) {
      const sharedGroup = document.createElement('optgroup');
      sharedGroup.label = '🔗 Shared with Me';
      sharedApps.forEach(app => {
        const option = document.createElement('option');
        option.value = app.id;
        const domain = extractDomain(app.base_url);
        option.textContent = `${app.name} (${domain || app.base_url})`;
        option.dataset.baseUrl = app.base_url;
        sharedGroup.appendChild(option);
      });
      select.appendChild(sharedGroup);
    }

    select.addEventListener('change', handleAppSelect);
    checkIfOnCorrectPage();
    updateAppInfo(null);
  } catch (error) {
    console.error('❌ Echo: Error loading apps:', error);
    showError('Failed to load apps: ' + error.message);
  }
}

// Helper function to make Supabase REST API calls
async function supabaseQuery(endpoint, authToken) {
  try {
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: errorText };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// Show info about who shared the app
function updateAppInfo(appId) {
  const infoDiv = document.getElementById('app-info');
  if (!infoDiv) return;
  
  if (!appId) {
    infoDiv.classList.add('hidden');
    return;
  }
  
  const app = apps.find(a => a.id === appId);
  if (!app) {
    infoDiv.classList.add('hidden');
    return;
  }
  
  if (app._isOwned) {
    infoDiv.innerHTML = `<span style="color: #166534;">✓ This is your app</span>`;
    infoDiv.classList.remove('hidden');
  } else if (app._sharedBy) {
    const accessLabel = getAccessLevelLabel(app._accessLevel);
    infoDiv.innerHTML = `<span style="color: #1e40af;">👤 Shared by <strong>${escapeHtml(app._sharedBy)}</strong></span><br><span style="color: #64748b; font-size: 11px;">Access: ${accessLabel}</span>`;
    infoDiv.classList.remove('hidden');
  } else {
    infoDiv.classList.add('hidden');
  }
}

function getAccessLevelLabel(level) {
  switch(level) {
    case 'admin': return '🔑 Admin';
    case 'moderator': return '🛡️ Moderator';
    case 'commenter': return '💬 Can comment';
    case 'viewer': return '👁️ View only';
    default: return level;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function handleAppSelect(event) {
  const appId = event.target.value;
  const gotoBtn = document.getElementById('goto-page-btn');
  const recordingControls = document.getElementById('recording-controls');

  if (appId) {
    await chrome.storage.local.set({ selectedAppId: appId });
    checkIfOnCorrectPage();
    updateAppInfo(appId);
  } else {
    gotoBtn.classList.add('hidden');
    recordingControls.classList.add('hidden');
    updateAppInfo(null);
  }
}

function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

async function checkIfOnCorrectPage() {
  const appId = document.getElementById('app-select').value;
  if (!appId) return;

  const app = apps.find(a => a.id === appId);
  if (!app) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const gotoBtn = document.getElementById('goto-page-btn');
  const recordingControls = document.getElementById('recording-controls');
  const domainWarning = document.getElementById('domain-warning');

  if (!tab || !tab.url) {
    gotoBtn.classList.remove('hidden');
    recordingControls.classList.add('hidden');
    domainWarning.classList.add('hidden');
    return;
  }

  const currentDomain = extractDomain(tab.url);
  const appDomain = extractDomain(app.base_url);

  if (currentDomain && appDomain && currentDomain === appDomain) {
    gotoBtn.classList.add('hidden');
    recordingControls.classList.remove('hidden');
    domainWarning.classList.add('hidden');
  } else {
    gotoBtn.classList.remove('hidden');
    recordingControls.classList.add('hidden');
    if (currentDomain && appDomain) {
      domainWarning.textContent = `Wrong domain! This app is for ${appDomain}, but you're on ${currentDomain}`;
      domainWarning.classList.remove('hidden');
    } else {
      domainWarning.classList.add('hidden');
    }
  }
}

async function handleGotoPage() {
  const appId = document.getElementById('app-select').value;
  if (!appId) return;

  const app = apps.find(a => a.id === appId);
  if (!app || !app.base_url) {
    showError('App URL not configured');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.update(tab.id, { url: app.base_url });

  setTimeout(() => {
    checkIfOnCorrectPage();
  }, 1000);
}

async function handleStartRecording() {
  const appId = document.getElementById('app-select').value;

  if (!appId) {
    showError('Please select an app');
    return;
  }

  const app = apps.find(a => a.id === appId);
  if (!app) {
    showError('App not found');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const currentDomain = extractDomain(tab.url);
  const appDomain = extractDomain(app.base_url);

  if (!currentDomain || !appDomain || currentDomain !== appDomain) {
    showError(`Cannot start recording on ${currentDomain || 'this page'}. This app is configured for ${appDomain || app.base_url}. Please use "Go to Page" button.`);
    return;
  }

  const result = await chrome.storage.local.get('userId');

  chrome.runtime.sendMessage({
    type: 'START_SESSION',
    appId: appId,
    userId: result.userId,
    tabId: tab.id,
    appDomain: appDomain
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error starting session:', chrome.runtime.lastError);
      return;
    }
    updateStatus(true, appId);
  });
}

async function handleStopRecording() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage({ type: 'STOP_SESSION', tabId: tab.id }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error stopping session:', chrome.runtime.lastError);
      return;
    }
    updateStatus(false);
  });
}

async function checkActiveSession() {
  chrome.runtime.sendMessage({ type: 'GET_SESSION' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting session:', chrome.runtime.lastError);
      return;
    }
    if (response && response.session) {
      updateStatus(true, response.session.appId);
    }
  });
}

function updateStatus(isActive, appId = null) {
  const status = document.getElementById('status');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const appSelect = document.getElementById('app-select');

  if (isActive) {
    const app = apps.find(a => a.id === appId);
    status.className = 'status active';
    status.innerHTML = `<strong>Recording Active</strong>${app ? `Tracking feedback for: ${app.name}` : 'Click elements to add comments'}`;
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    appSelect.disabled = true;
  } else {
    status.className = 'status';
    status.innerHTML = '<strong>Not Recording</strong>Select an app to start tracking feedback';
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    appSelect.disabled = false;
  }
}

function showLoginSection(e) {
  if (e) e.preventDefault();
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('app-section').classList.add('hidden');
  // Clear any previous errors
  hideError();
  hideSignupError();
  document.getElementById('signup-success-message').classList.add('hidden');
}

function showAppSection() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('signup-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-message').classList.add('hidden');
}

function setLoading(loading) {
  const btn = document.getElementById('login-btn');
  btn.disabled = loading;
  btn.textContent = loading ? 'Signing in...' : 'Sign In';
}

function openDashboard(e) {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://echo.analyzthis.ai' });
}
