let isEchoActive = false;
let isReviewMode = false; // NEW: Review mode (view-only, no recording)
let selectedElement = null;
let commentWidget = null;
let highlightOverlay = null;
let existingThreads = [];
let allAppThreads = [];
let commentPins = [];
let activeSession = null;
let commentsPanelOpen = false;
let commentsPanel = null;
let fabButton = null;
let showResolvedComments = true;
let matchedApp = null; // NEW: Store matched app for current page

function getCurrentDomain() {
  try {
    return normalizeDomain(new URL(window.location.href).hostname);
  } catch (e) {
    return null;
  }
}

function normalizeDomain(domain) {
  if (!domain) return null;
  return domain.replace(/^www\./, '').toLowerCase();
}

// NEW: Auto-detect if current page belongs to a user's app
async function autoDetectApp() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userId', 'userApps', 'supabaseUrl']);
    
    if (!result.authToken || !result.userId) {
      console.log('🔍 Echo: User not logged in, skipping auto-detect');
      return;
    }

    const currentDomain = getCurrentDomain();
    const currentUrl = window.location.href;
    
    if (!currentDomain) return;

    // Check if we have cached apps, if not fetch them
    let apps = result.userApps;
    if (!apps || apps.length === 0) {
      console.log('🔍 Echo: Fetching user apps for auto-detect...');
      apps = await fetchUserApps(result);
      if (apps && apps.length > 0) {
        await chrome.storage.local.set({ userApps: apps });
      }
    }

    if (!apps || apps.length === 0) {
      console.log('🔍 Echo: No apps found for user');
      return;
    }

    // Find app that matches current domain
    const matched = apps.find(app => {
      if (!app.base_url) return false;
      try {
        const appDomain = normalizeDomain(new URL(app.base_url).hostname);
        return appDomain === currentDomain;
      } catch (e) {
        return false;
      }
    });

    if (matched) {
      console.log('✅ Echo: Auto-detected app:', matched.name, '(ID:', matched.id, ') for domain:', currentDomain);
      console.log('📱 Echo: App details:', { id: matched.id, name: matched.name, base_url: matched.base_url });
      matchedApp = matched;

      // Enter review mode (show comments without recording)
      enterReviewMode(matched);
    } else {
      console.log('🔍 Echo: No matching app for domain:', currentDomain);
      console.log('📋 Echo: Available apps:', apps.map(a => ({ name: a.name, domain: a.base_url })));
    }
  } catch (error) {
    console.error('❌ Echo: Auto-detect error:', error);
  }
}

// NEW: Fetch user's apps from Supabase
async function fetchUserApps(authData) {
  try {
    const apiUrl = `${authData.supabaseUrl || window.SUPABASE_CONFIG.url}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    // Fetch workspace-based apps
    const workspaceResponse = await fetch(
      `${apiUrl}/workspace_members?user_id=eq.${authData.userId}&select=workspace_id`, {
      headers: {
        'Authorization': `Bearer ${authData.authToken}`,
        'apikey': anonKey
      }
    });

    if (!workspaceResponse.ok) return [];
    const workspaces = await workspaceResponse.json();
    const workspaceIds = workspaces.map(w => w.workspace_id);

    // Fetch shared apps (via app_collaborators)
    const collaboratorResponse = await fetch(
      `${apiUrl}/app_collaborators?user_id=eq.${authData.userId}&select=app_id`, {
      headers: {
        'Authorization': `Bearer ${authData.authToken}`,
        'apikey': anonKey
      }
    });

    let collaboratorAppIds = [];
    if (collaboratorResponse.ok) {
      const collaborators = await collaboratorResponse.json();
      collaboratorAppIds = collaborators.map(c => c.app_id);
    }

    let allApps = [];

    // Load workspace apps
    if (workspaceIds.length > 0) {
      const workspaceAppsResponse = await fetch(
        `${apiUrl}/apps?workspace_id=in.(${workspaceIds.join(',')})&select=*&is_active=eq.true`, {
        headers: {
          'Authorization': `Bearer ${authData.authToken}`,
          'apikey': anonKey
        }
      });

      if (workspaceAppsResponse.ok) {
        allApps = await workspaceAppsResponse.json();
      }
    }

    // Load shared apps
    if (collaboratorAppIds.length > 0) {
      const sharedAppsResponse = await fetch(
        `${apiUrl}/apps?id=in.(${collaboratorAppIds.join(',')})&select=*&is_active=eq.true`, {
        headers: {
          'Authorization': `Bearer ${authData.authToken}`,
          'apikey': anonKey
        }
      });

      if (sharedAppsResponse.ok) {
        const sharedApps = await sharedAppsResponse.json();
        const existingIds = new Set(allApps.map(a => a.id));
        sharedApps.forEach(app => {
          if (!existingIds.has(app.id)) {
            allApps.push(app);
          }
        });
      }
    }

    return allApps;
  } catch (error) {
    console.error('❌ Echo: Failed to fetch user apps:', error);
    return [];
  }
}

// NEW: Enter review mode - show comments without recording
async function enterReviewMode(app) {
  if (isReviewMode || isEchoActive) {
    console.log('ℹ️ Echo: Already in review/active mode');
    return;
  }

  console.log('👁️ Echo: Entering review mode for', app.name);
  isReviewMode = true;
  matchedApp = app;

  // Create a pseudo-session for loading comments
  activeSession = {
    appId: app.id,
    appDomain: getCurrentDomain(),
    reviewMode: true
  };

  // Load and display comments
  await loadExistingComments();
  showReviewFAB();
  console.log('✅ Echo: Review mode activated, FAB should be visible');
}

// NEW: Show review mode FAB (different from recording FAB)
function showReviewFAB() {
  if (fabButton) {
    console.log('📌 Echo: FAB button already exists');
    fabButton.style.display = 'block';
    return;
  }

  if (!document.body) {
    console.log('⏳ Echo: document.body not ready, retrying...');
    setTimeout(showReviewFAB, 100);
    return;
  }

  console.log('📌 Echo: Creating FAB button');
  fabButton = document.createElement('div');
  fabButton.id = 'echo-review-fab';
  fabButton.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <button id="echo-fab-main" style="
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        transition: all 0.3s ease;
        position: relative;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span id="echo-comment-count" style="
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: bold;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        ">0</span>
      </button>
      <div id="echo-fab-tooltip" style="
        background: #1e293b;
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
      ">
        <strong>${matchedApp?.name || 'Echo'}</strong> - Click to view comments
      </div>
    </div>
  `;

  document.body.appendChild(fabButton);
  console.log('✅ Echo: FAB button added to DOM');

  const mainBtn = fabButton.querySelector('#echo-fab-main');
  const tooltip = fabButton.querySelector('#echo-fab-tooltip');

  mainBtn.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
    mainBtn.style.transform = 'scale(1.1)';
  });

  mainBtn.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
    mainBtn.style.transform = 'scale(1)';
  });

  mainBtn.addEventListener('click', () => {
    if (commentsPanelOpen) {
      hideCommentsPanel();
    } else {
      showCommentsPanel();
    }
  });

  // Update comment count
  updateReviewFABCount();
}

// NEW: Update the comment count badge on review FAB
function updateReviewFABCount() {
  const countBadge = document.getElementById('echo-comment-count');
  if (countBadge) {
    const openCount = existingThreads.filter(t => t.status !== 'resolved').length;
    countBadge.textContent = openCount.toString();
    countBadge.style.display = openCount > 0 ? 'flex' : 'none';
  }
}

// Initialize auto-detect on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(autoDetectApp, 500); // Small delay to ensure page is ready
  });
} else {
  setTimeout(autoDetectApp, 500);
}

// Also check on URL changes (for SPAs)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('🔄 Echo: URL changed, re-checking...');
    // Reset and re-check
    if (isReviewMode && !isEchoActive) {
      existingThreads = [];
      clearAllPins();
      loadExistingComments();
    }
  }
});

urlObserver.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SESSION_ACTIVE') {
    console.log('✅ Echo: Session activated', message.session);

    const currentDomain = getCurrentDomain();
    const sessionDomain = normalizeDomain(message.session.appDomain);

    if (currentDomain && sessionDomain && currentDomain !== sessionDomain) {
      console.error('❌ Echo: Domain mismatch!', {
        current: currentDomain,
        expected: sessionDomain
      });
      alert(`⚠️ Cannot record on ${currentDomain}.\n\nThis app is configured for ${sessionDomain}.\n\nPlease navigate to ${sessionDomain} or select a different app.`);
      sendResponse({ success: false, error: 'Domain mismatch' });
      return true;
    }

    // Exit review mode if active
    if (isReviewMode) {
      console.log('🔄 Echo: Exiting review mode to enter recording mode');
      isReviewMode = false;
    }

    activeSession = message.session;
    isEchoActive = true;
    loadExistingComments();
    showFAB();
    document.body.style.cursor = 'crosshair';
    console.log('✅ Echo: Ready to capture feedback - click any element');
    console.log('🎯 Echo: Click anywhere on the page to add a comment');
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'SESSION_STOPPED') {
    console.log('🛑 Echo: Received SESSION_STOPPED from background');

    // Only do cleanup if not already done by local handler
    if (isEchoActive) {
      console.log('🧹 Echo: Doing cleanup from SESSION_STOPPED');
    isEchoActive = false;
    activeSession = null;
    clearAllPins();
    hideFAB();
    hideCommentsPanel();

      // Reset cursor - try multiple approaches
    document.body.style.cursor = '';
      document.body.style.removeProperty('cursor');
      document.documentElement.style.cursor = '';
      document.documentElement.style.removeProperty('cursor');

      // Close any open thread viewers
      const existingViewers = document.querySelectorAll('.echo-thread-viewer');
      existingViewers.forEach(viewer => viewer.remove());
    } else {
      console.log('ℹ️ Echo: Cleanup already done locally');
    }

    console.log('✅ Echo: SESSION_STOPPED handling complete');
    sendResponse({ success: true });
    return true;
  }
});

async function loadExistingComments() {
  if (!activeSession) {
    console.log('⚠️ Echo: No active session, skipping comment load');
    return;
  }

  try {
    console.log('📥 Echo: Loading comments for app ID:', activeSession.appId);
    const result = await chrome.storage.local.get(['authToken', 'supabaseUrl']);
    const apiUrl = `${result.supabaseUrl || window.SUPABASE_CONFIG.url}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    const currentPageUrl = window.location.href;
    console.log('📍 Echo: Current page URL:', currentPageUrl);

    const [pageThreadsResponse, allThreadsResponse] = await Promise.all([
      fetch(
        `${apiUrl}/threads?app_id=eq.${activeSession.appId}&page_url=eq.${encodeURIComponent(currentPageUrl)}&select=*,comments(*,author:profiles(id,email,full_name))&order=created_at.desc`,
        {
          headers: {
            'Authorization': `Bearer ${result.authToken}`,
            'apikey': anonKey
          }
        }
      ),
      fetch(
        `${apiUrl}/threads?app_id=eq.${activeSession.appId}&select=*,comments(*,author:profiles(id,email,full_name))&order=created_at.desc`,
        {
          headers: {
            'Authorization': `Bearer ${result.authToken}`,
            'apikey': anonKey
          }
        }
      )
    ]);

    if (pageThreadsResponse.ok) {
      existingThreads = await pageThreadsResponse.json();
      console.log(`📍 Echo: Found ${existingThreads.length} comments on this page`);
      displayCommentPinsOnElements(); // NEW: Try to attach to DOM elements first
    }

    if (allThreadsResponse.ok) {
      allAppThreads = await allThreadsResponse.json();
      console.log(`📊 Echo: Total ${allAppThreads.length} comments across all pages`);
    }

    refreshCommentsPanel();
    
    // Update FAB count in review mode
    if (isReviewMode) {
      updateReviewFABCount();
    }
  } catch (error) {
    console.error('Failed to load existing comments:', error);
  }
}

// NEW: Display comment pins attached to actual DOM elements
function displayCommentPinsOnElements() {
  clearAllPins();

  // Add pulse animation keyframes if not already present
  if (!document.getElementById('echo-pulse-keyframes')) {
    const style = document.createElement('style');
    style.id = 'echo-pulse-keyframes';
    style.textContent = `
      @keyframes echo-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      @keyframes echo-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  existingThreads.forEach(thread => {
    const pin = createSmartCommentPin(thread);
    if (pin) {
      document.body.appendChild(pin);
      commentPins.push(pin);
    }
  });
}

// NEW: Create a comment pin with smart element matching
function createSmartCommentPin(thread) {
  let targetElement = null;
  let pinPosition = { x: 0, y: 0 };
  let attachedToElement = false;

  // Try to find the element using DOM selector
  if (thread.dom_selector) {
    const selector = typeof thread.dom_selector === 'string' 
      ? thread.dom_selector 
      : thread.dom_selector.selector;
    
    if (selector) {
      targetElement = findElementSmart(selector, thread.position_data);
      if (targetElement) {
        attachedToElement = true;
        const rect = targetElement.getBoundingClientRect();
        // Position pin at top-right corner of element
        pinPosition = {
          x: rect.right + window.scrollX - 16,
          y: rect.top + window.scrollY - 16
        };
        console.log(`✅ Echo: Found element for thread ${thread.id.slice(0,8)}:`, selector);
      }
    }
  }

  // Fallback to position data if element not found
  if (!attachedToElement && thread.position_data) {
    const pos = typeof thread.position_data === 'string'
      ? JSON.parse(thread.position_data)
      : thread.position_data;

    const scrollX = pos.scrollX || 0;
    const scrollY = pos.scrollY || 0;

    pinPosition = {
      x: (pos.x || 0) - scrollX,
      y: (pos.y || 0) - scrollY
    };
    console.log(`⚠️ Echo: Using position fallback for thread ${thread.id.slice(0,8)}`);
  }

  // Create the pin element
    const pin = document.createElement('div');
    pin.className = 'echo-pin';
    pin.dataset.threadId = thread.id;
  pin.dataset.attachedToElement = attachedToElement.toString();
  
  const isResolved = thread.status === 'resolved';
  const commentCount = thread.comments?.length || 1;
  
    pin.style.cssText = `
      position: absolute;
    left: ${pinPosition.x}px;
    top: ${pinPosition.y}px;
      width: 32px;
      height: 32px;
    background: ${isResolved ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      z-index: 999997;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    transition: all 0.2s ease;
    ${attachedToElement ? 'animation: echo-glow 2s ease-in-out infinite;' : ''}
    `;

  pin.innerHTML = `<span>${commentCount}</span>`;

  // Hover effects
    pin.addEventListener('mouseenter', () => {
      pin.style.transform = 'scale(1.2)';
    pin.style.zIndex = '999999';
    
    // Highlight the target element if attached
    if (attachedToElement && targetElement) {
      targetElement.style.outline = '3px solid #3b82f6';
      targetElement.style.outlineOffset = '2px';
    }
    });

    pin.addEventListener('mouseleave', () => {
      pin.style.transform = 'scale(1)';
    pin.style.zIndex = '999997';
    
    // Remove highlight
    if (attachedToElement && targetElement) {
      targetElement.style.outline = '';
      targetElement.style.outlineOffset = '';
    }
    });

  // Click to show thread
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      showThreadViewer(thread);
    });

  return pin;
}

// NEW: Smart element finder with multiple fallback strategies
function findElementSmart(selector, positionData) {
  // Strategy 1: Try exact selector
  try {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  } catch (e) {
    console.warn('Invalid selector:', selector);
  }

  // Strategy 2: Try parent selectors (progressively less specific)
  const parts = selector.split(' > ');
  for (let i = parts.length - 1; i >= 1; i--) {
    try {
      const partialSelector = parts.slice(0, i).join(' > ');
      const element = document.querySelector(partialSelector);
      if (element && isElementVisible(element)) {
        console.log(`🔍 Echo: Found parent element with partial selector`);
        return element;
      }
    } catch (e) {
      continue;
    }
  }

  // Strategy 3: Try by ID if selector contains one
  const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    const element = document.getElementById(idMatch[1]);
    if (element && isElementVisible(element)) {
      console.log(`🔍 Echo: Found element by ID: ${idMatch[1]}`);
      return element;
    }
  }

  // Strategy 4: Try by class if selector contains one
  const classMatch = selector.match(/\.([a-zA-Z0-9_-]+)/g);
  if (classMatch && classMatch.length > 0) {
    const className = classMatch[classMatch.length - 1].slice(1);
    const elements = document.getElementsByClassName(className);
    if (elements.length === 1 && isElementVisible(elements[0])) {
      console.log(`🔍 Echo: Found element by class: ${className}`);
      return elements[0];
    }
  }

  // Strategy 5: Find by position (within tolerance)
  if (positionData) {
    const pos = typeof positionData === 'string' ? JSON.parse(positionData) : positionData;
    const element = findElementByPosition(pos.x, pos.y, 50);
    if (element) {
      console.log(`🔍 Echo: Found element by position`);
      return element;
    }
  }

  return null;
}

// Check if element is visible in viewport
function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Find element at approximate position
function findElementByPosition(x, y, tolerance = 30) {
  // Get element at the exact position first
  const elementAtPoint = document.elementFromPoint(
    x - window.scrollX,
    y - window.scrollY
  );
  
  if (elementAtPoint && elementAtPoint !== document.body && elementAtPoint !== document.documentElement) {
    return elementAtPoint;
  }

  // Try nearby positions
  const offsets = [
    [0, 0], [tolerance, 0], [-tolerance, 0], [0, tolerance], [0, -tolerance],
    [tolerance, tolerance], [-tolerance, -tolerance], [tolerance, -tolerance], [-tolerance, tolerance]
  ];

  for (const [dx, dy] of offsets) {
    const el = document.elementFromPoint(
      x - window.scrollX + dx,
      y - window.scrollY + dy
    );
    if (el && el !== document.body && el !== document.documentElement) {
      return el;
    }
  }

  return null;
}

// Legacy function - now calls the smart version
function displayCommentPins() {
  displayCommentPinsOnElements();
}

function clearAllPins() {
  commentPins.forEach(pin => pin.remove());
  commentPins = [];
}

function getOptimalSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('echo-'));
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(el =>
        el.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

function createHighlightOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'echo-highlight-overlay';
  overlay.style.cssText = `
    position: absolute;
    border: 2px solid #3B82F6;
    background: rgba(59, 130, 246, 0.1);
    pointer-events: none;
    z-index: 999998;
    border-radius: 4px;
    transition: all 0.2s;
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function highlightElement(element) {
  if (!highlightOverlay) {
    highlightOverlay = createHighlightOverlay();
  }

  const rect = element.getBoundingClientRect();
  highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
  highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
  highlightOverlay.style.width = `${rect.width}px`;
  highlightOverlay.style.height = `${rect.height}px`;
  highlightOverlay.style.display = 'block';
}

function hideHighlight() {
  if (highlightOverlay) {
    highlightOverlay.style.display = 'none';
  }
}

document.addEventListener('mouseover', (e) => {
  if (!isEchoActive || commentWidget) return;

  const target = e.target;
  if (target.closest('#echo-widget') ||
      target.closest('.echo-pin') ||
      target.closest('.echo-thread-viewer')) {
    return;
  }

  highlightElement(target);
  selectedElement = target;
});

document.addEventListener('click', (e) => {
  console.log('👆 Echo: Click detected', {
    isActive: isEchoActive,
    isReviewMode: isReviewMode,
    hasWidget: !!commentWidget,
    target: e.target.tagName,
    targetClasses: e.target.className
  });

  if (!isEchoActive) {
    console.log('⚠️ Echo: Session not active - start recording first');
    return;
  }

  if (isReviewMode) {
    console.log('ℹ️ Echo: In review mode - recording disabled');
    return;
  }

  if (commentWidget) {
    console.log('📋 Echo: Widget already open');
    return;
  }

  const target = e.target;
  if (target.closest('#echo-widget') ||
      target.closest('.echo-pin') ||
      target.closest('.echo-thread-viewer') ||
      target.closest('#echo-fab') ||
      target.closest('#echo-review-fab') ||
      target.closest('#echo-panel')) {
    console.log('🚫 Echo: Clicked on Echo UI element, ignoring');
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const selector = getOptimalSelector(target);
  console.log('✅ Echo: Element selected', {
    tag: target.tagName,
    id: target.id,
    classes: target.className,
    selector: selector
  });

  showCommentWidget(target, e.pageX, e.pageY);
}, true);

function showCommentWidget(element, x, y) {
  if (commentWidget) {
    closeWidget();
  }

  const widget = document.createElement('div');
  widget.id = 'echo-widget';

  const widgetWidth = 320;
  const widgetHeight = 220;
  const padding = 16;

  let finalX = x + padding;
  let finalY = y + padding;

  if (finalX + widgetWidth > window.innerWidth) {
    finalX = window.innerWidth - widgetWidth - padding;
  }
  if (finalX < padding) {
    finalX = padding;
  }

  if (finalY + widgetHeight > window.innerHeight + window.scrollY) {
    finalY = y - widgetHeight - padding;
    if (finalY < window.scrollY + padding) {
      finalY = window.scrollY + padding;
    }
  }

  widget.style.cssText = `
    position: absolute;
    top: ${finalY}px;
    left: ${finalX}px;
    width: ${widgetWidth}px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 16px;
  `;

  widget.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Add Comment</h3>
      <button id="echo-close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; padding: 0; width: 24px; height: 24px;">×</button>
    </div>
    <textarea id="echo-textarea"
      placeholder="Describe the issue or feedback..."
      style="width: 100%; height: 100px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; resize: none; font-family: inherit; margin-bottom: 12px; box-sizing: border-box;"
    ></textarea>
    <div style="display: flex; gap: 8px;">
      <button id="echo-submit"
        style="flex: 1; background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">
        Submit
      </button>
      <button id="echo-cancel"
        style="flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(widget);

  const textarea = widget.querySelector('#echo-textarea');
  textarea.focus();

  widget.querySelector('#echo-close').onclick = closeWidget;
  widget.querySelector('#echo-cancel').onclick = closeWidget;
  widget.querySelector('#echo-submit').onclick = () => submitComment(element, textarea.value);

  commentWidget = widget;
}

function closeWidget() {
  if (commentWidget) {
    commentWidget.remove();
    commentWidget = null;
  }
  hideHighlight();
  selectedElement = null;
}

function captureHTMLSnapshot() {
  const clonedDoc = document.cloneNode(true);

  // Remove scripts (security)
  const scripts = clonedDoc.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove iframes (security)
  const iframes = clonedDoc.querySelectorAll('iframe');
  iframes.forEach(iframe => iframe.remove());

  // Remove Echo elements
  const echoElements = clonedDoc.querySelectorAll('[id^="echo"], [class*="echo"]');
  echoElements.forEach(el => el.remove());

  // ========================================
  // PRIVACY: Sanitize sensitive data
  // ========================================
  
  // Redact password fields
  const passwordFields = clonedDoc.querySelectorAll('input[type="password"]');
  passwordFields.forEach(el => {
    el.value = '';
    el.setAttribute('placeholder', '[Password Redacted]');
  });

  // Redact sensitive input types
  const sensitiveInputs = clonedDoc.querySelectorAll(`
    input[type="email"],
    input[type="tel"],
    input[name*="card"],
    input[name*="credit"],
    input[name*="cvv"],
    input[name*="ssn"],
    input[name*="social"],
    input[name*="password"],
    input[name*="secret"],
    input[name*="token"],
    input[autocomplete="cc-number"],
    input[autocomplete="cc-csc"],
    input[autocomplete="cc-exp"],
    [data-sensitive],
    [data-private],
    .sensitive,
    .private,
    .pii
  `);
  sensitiveInputs.forEach(el => {
    if (el.value) {
      el.value = '[Redacted]';
    }
  });

  // Remove CSRF tokens and auth meta tags
  const sensitiveMetaTags = clonedDoc.querySelectorAll(`
    meta[name*="csrf"],
    meta[name*="token"],
    meta[name*="auth"],
    meta[name*="api-key"],
    meta[name*="secret"]
  `);
  sensitiveMetaTags.forEach(el => el.remove());

  // Remove hidden inputs that might contain tokens
  const hiddenInputs = clonedDoc.querySelectorAll('input[type="hidden"]');
  hiddenInputs.forEach(el => {
    const name = (el.name || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    if (name.includes('token') || name.includes('csrf') || name.includes('auth') ||
        id.includes('token') || id.includes('csrf') || id.includes('auth')) {
      el.value = '[Token Redacted]';
    }
  });

  // Remove inline event handlers (security)
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove onclick, onload, etc.
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Remove noscript content
  const noscripts = clonedDoc.querySelectorAll('noscript');
  noscripts.forEach(el => el.remove());

  // ========================================
  // Add base tag for relative URLs
  // ========================================
  const head = clonedDoc.querySelector('head');
  const baseTag = clonedDoc.createElement('base');
  baseTag.href = window.location.origin;
  if (head) {
  head.insertBefore(baseTag, head.firstChild);
  }

  // Add privacy notice comment
  const privacyComment = clonedDoc.createComment(
    ' Echo DOM Snapshot - Captured for feedback purposes. ' +
    'Sensitive data has been automatically redacted. '
  );
  clonedDoc.insertBefore(privacyComment, clonedDoc.firstChild);

  const htmlSnapshot = {
    html: clonedDoc.documentElement.outerHTML,
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    capturedBy: 'Echo Extension',
    privacyNote: 'Sensitive data (passwords, tokens, PII) automatically redacted',
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    styles: Array.from(document.styleSheets).slice(0, 10).map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      } catch (e) {
        return '';
      }
    }).join('\n')
  };

  console.log('🔒 Echo: DOM snapshot captured with privacy sanitization');
  return htmlSnapshot;
}

async function submitComment(element, text) {
  if (!text.trim()) {
    alert('Please enter a comment');
    return;
  }

  const rect = element.getBoundingClientRect();

  try {
    // First, capture the screenshot of the current viewport
    const screenshotPromise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('⚠️ Could not capture screenshot:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response?.screenshot || null);
        }
      });
    });

    const screenshot = await screenshotPromise;
    console.log('📸 Screenshot captured:', screenshot ? 'Yes' : 'No');

    // Capture HTML snapshot for DOM rendering (bypasses iframe restrictions)
    let htmlSnapshot = null;
    try {
      htmlSnapshot = captureHTMLSnapshot();
      console.log('📄 HTML snapshot captured:', htmlSnapshot ? 'Yes' : 'No');
    } catch (e) {
      console.warn('⚠️ Could not capture HTML snapshot:', e);
    }

    const commentData = {
      domSelector: getOptimalSelector(element),
      text: text.trim(),
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      screenshot: screenshot,
      htmlSnapshot: htmlSnapshot,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };

    chrome.runtime.sendMessage(
      { type: 'SAVE_COMMENT', data: commentData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Extension context error:', chrome.runtime.lastError);
          showNotification('Extension was reloaded. Please refresh the page and try again.', 'error');
          return;
        }

        if (response.success) {
          showNotification('Comment saved successfully!', 'success');
          closeWidget();
          loadExistingComments();
          refreshCommentsPanel();
        } else {
          showNotification('Failed to save comment: ' + response.error, 'error');
        }
      }
    );
  } catch (error) {
    console.error('❌ Error submitting comment:', error);
    showNotification('Failed to save comment. Please refresh the page and try again.', 'error');
  }
}

function showThreadViewer(thread) {
  // Close any existing thread viewers first
  const existingViewers = document.querySelectorAll('.echo-thread-viewer');
  existingViewers.forEach(viewer => viewer.remove());

  // Find the pin that was clicked to position the viewer near it
  const clickedPin = document.querySelector(`.echo-pin[data-thread-id="${thread.id}"]`);
  let viewerX = 20; // default right position
  let viewerY = 20; // default top position

  if (clickedPin) {
    const pinRect = clickedPin.getBoundingClientRect();
    const pinCenterX = pinRect.left + pinRect.width / 2;
    const pinCenterY = pinRect.top + pinRect.height / 2;

    // Position viewer to the right of the pin, or left if not enough space
    const viewerWidth = 400;
    const padding = 20;

    if (pinCenterX + viewerWidth + padding < window.innerWidth) {
      // Position to the right of the pin
      viewerX = pinCenterX + padding;
      viewerY = Math.max(20, pinCenterY - 200); // Center vertically around pin
    } else {
      // Position to the left of the pin
      viewerX = pinCenterX - viewerWidth - padding;
      viewerY = Math.max(20, pinCenterY - 200);
    }

    // Ensure viewer doesn't go off-screen
    viewerX = Math.max(20, Math.min(viewerX, window.innerWidth - viewerWidth - 20));
    viewerY = Math.max(20, Math.min(viewerY, window.innerHeight - 400 - 20));
  }

  const viewer = document.createElement('div');
  viewer.className = 'echo-thread-viewer';
  viewer.style.cssText = `
    position: fixed;
    left: ${viewerX}px;
    top: ${viewerY}px;
    width: 400px;
    max-height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  const screenshot = thread.comments[0]?.metadata?.screenshot || '';

  const firstCommentAuthor = thread.comments?.[0]?.author;
  const threadAuthorName = firstCommentAuthor?.full_name || firstCommentAuthor?.email?.split('@')[0] || 'Unknown';

  viewer.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; background: #0f172a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">
            ${threadAuthorName.charAt(0).toUpperCase()}
          </div>
      <div>
            <div style="font-size: 14px; font-weight: 600; color: #1e293b;">${threadAuthorName}</div>
            <div style="font-size: 11px; color: #64748b;">Started this thread</div>
          </div>
        </div>
        <button class="thread-close" style="background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${thread.status === 'resolved' ? '#D1FAE5' : '#DBEAFE'}; color: ${thread.status === 'resolved' ? '#065F46' : '#1E40AF'};">
            ${thread.status}
          </span>
          <span style="font-size: 11px; color: #64748b;">${thread.comments.length} comment${thread.comments.length !== 1 ? 's' : ''}</span>
        </div>
    </div>

    ${screenshot ? `<img src="${screenshot}" style="width: 100%; height: auto; border-bottom: 1px solid #e2e8f0;">` : ''}

    <div style="flex: 1; overflow-y: auto; padding: 16px; max-height: 400px;" class="comments-container">
      ${thread.comments.map(comment => renderComment(comment, thread)).join('')}
    </div>

    <div style="padding: 16px; border-top: 1px solid #e2e8f0;">
      <textarea class="reply-input" placeholder="Add a reply..." style="width: 100%; height: 60px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; resize: none; font-family: inherit; box-sizing: border-box; margin-bottom: 8px;"></textarea>
      <div style="display: flex; gap: 8px;">
        <button class="send-reply" style="flex: 1; background: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Reply</button>
        ${thread.status === 'open'
          ? '<button class="resolve-thread" style="flex: 1; background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Resolve</button>'
          : '<button class="reopen-thread" style="flex: 1; background: #F59E0B; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Reopen</button>'
        }
      </div>
    </div>
  `;

  document.body.appendChild(viewer);

  viewer.querySelector('.thread-close').addEventListener('click', () => viewer.remove());
  viewer.querySelector('.send-reply').addEventListener('click', () => handleReply(thread, viewer));

  const resolveBtn = viewer.querySelector('.resolve-thread');
  const reopenBtn = viewer.querySelector('.reopen-thread');

  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => handleResolveThread(thread, viewer));
  }
  if (reopenBtn) {
    reopenBtn.addEventListener('click', () => handleReopenThread(thread, viewer));
  }

  viewer.querySelectorAll('.edit-comment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const commentId = e.target.dataset.commentId;
      handleEditComment(commentId, viewer);
    });
  });

  viewer.querySelectorAll('.delete-comment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const commentId = e.target.dataset.commentId;
      handleDeleteComment(commentId, thread, viewer);
    });
  });
}

function renderComment(comment, thread) {
  const isAuthor = comment.author_id === activeSession?.userId;
  const authorName = comment.author?.full_name || comment.author?.email?.split('@')[0] || 'Unknown User';
  const authorEmail = comment.author?.email || '';

  return `
    <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;" data-comment-id="${comment.id}">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 24px; height: 24px; background: #0f172a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600;">
              ${authorName.charAt(0).toUpperCase()}
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b;">${authorName}</div>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-left: 30px;">${new Date(comment.created_at).toLocaleString()}</div>
        </div>
        ${isAuthor ? `
          <div style="display: flex; gap: 4px;">
            <button class="edit-comment" data-comment-id="${comment.id}" style="background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Edit comment">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="delete-comment" data-comment-id="${comment.id}" style="background: none; border: none; cursor: pointer; color: #EF4444; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;" title="Delete comment">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
      <div class="comment-content" style="font-size: 13px; color: #475569; white-space: pre-wrap;">${comment.content}</div>
      ${comment.metadata?.screenshot ? `
        <div style="margin-top: 12px;">
          <img src="${comment.metadata.screenshot}" alt="Screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="window.open('${comment.metadata.screenshot}', '_blank')">
        </div>
      ` : ''}
      ${comment.metadata?.htmlSnapshot ? `
        <div style="margin-top: 8px;">
          <button onclick="(function() {
            const win = window.open('', '_blank');
            win.document.write('${comment.metadata.htmlSnapshot.html.replace(/'/g, "\\'")}');
            win.document.close();
          })()" style="font-size: 11px; color: #3B82F6; background: none; border: none; cursor: pointer; text-decoration: underline;">
            View Interactive HTML Snapshot
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

async function handleReply(thread, viewer) {
  const input = viewer.querySelector('.reply-input');
  const text = input.value.trim();

  if (!text) {
    alert('Please enter a reply');
    return;
  }

  try {
    const result = await chrome.storage.local.get(['authToken', 'userId', 'supabaseUrl']);
    const apiUrl = `${result.supabaseUrl}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    const response = await fetch(`${apiUrl}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': anonKey
      },
      body: JSON.stringify({
        thread_id: thread.id,
        author_id: result.userId,
        content: text
      })
    });

    if (response.ok) {
      showNotification('Reply added!', 'success');
      viewer.remove();
      await loadExistingComments();
    } else {
      throw new Error('Failed to add reply');
    }
  } catch (error) {
    showNotification('Failed to add reply', 'error');
  }
}

async function handleResolveThread(thread, viewer) {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userId', 'supabaseUrl']);
    const apiUrl = `${result.supabaseUrl}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    const response = await fetch(`${apiUrl}/threads?id=eq.${thread.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': anonKey
      },
      body: JSON.stringify({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: result.userId
      })
    });

    if (response.ok) {
      showNotification('Thread resolved!', 'success');
      viewer.remove();
      await loadExistingComments();
    }
  } catch (error) {
    showNotification('Failed to resolve thread', 'error');
  }
}

async function handleReopenThread(thread, viewer) {
  try {
    const result = await chrome.storage.local.get(['authToken', 'userId', 'supabaseUrl']);
    const apiUrl = `${result.supabaseUrl}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    const response = await fetch(`${apiUrl}/threads?id=eq.${thread.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': anonKey
      },
      body: JSON.stringify({
        status: 'open',
        resolved_at: null,
        resolved_by: null
      })
    });

    if (response.ok) {
      showNotification('Thread reopened!', 'success');
      viewer.remove();
      await loadExistingComments();
    }
  } catch (error) {
    showNotification('Failed to reopen thread', 'error');
  }
}

async function handleEditComment(commentId, viewer) {
  const commentDiv = viewer.querySelector(`[data-comment-id="${commentId}"]`);
  const contentDiv = commentDiv.querySelector('.comment-content');
  const currentText = contentDiv.textContent;

  contentDiv.innerHTML = `
    <textarea style="width: 100%; height: 80px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; resize: none; font-family: inherit; box-sizing: border-box; margin-bottom: 8px;">${currentText}</textarea>
    <div style="display: flex; gap: 8px;">
      <button class="save-edit" style="flex: 1; background: #0f172a; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">Save</button>
      <button class="cancel-edit" style="flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;">Cancel</button>
    </div>
  `;

  const textarea = contentDiv.querySelector('textarea');
  textarea.focus();

  contentDiv.querySelector('.save-edit').addEventListener('click', async () => {
    const newText = textarea.value.trim();
    if (!newText) return;

    try {
      const result = await chrome.storage.local.get(['authToken', 'supabaseUrl']);
      const apiUrl = `${result.supabaseUrl}/rest/v1`;
      const anonKey = window.SUPABASE_CONFIG.anonKey;

      const response = await fetch(`${apiUrl}/comments?id=eq.${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.authToken}`,
          'apikey': anonKey
        },
        body: JSON.stringify({
          content: newText,
          edited_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        contentDiv.textContent = newText;
        showNotification('Comment updated!', 'success');
      }
    } catch (error) {
      showNotification('Failed to update comment', 'error');
      contentDiv.textContent = currentText;
    }
  });

  contentDiv.querySelector('.cancel-edit').addEventListener('click', () => {
    contentDiv.textContent = currentText;
  });
}

async function handleDeleteComment(commentId, thread, viewer) {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    const result = await chrome.storage.local.get(['authToken', 'supabaseUrl']);
    const apiUrl = `${result.supabaseUrl}/rest/v1`;
    const anonKey = window.SUPABASE_CONFIG.anonKey;

    const response = await fetch(`${apiUrl}/comments?id=eq.${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'apikey': anonKey
      }
    });

    if (response.ok) {
      showNotification('Comment deleted!', 'success');
      viewer.remove();
      await loadExistingComments();

      if (thread.comments.length === 1) {
        await fetch(`${apiUrl}/threads?id=eq.${thread.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${result.authToken}`,
            'apikey': anonKey
          }
        });
      }
    }
  } catch (error) {
    showNotification('Failed to delete comment', 'error');
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: white;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showFAB() {
  // Hide review FAB if it exists
  if (fabButton && fabButton.id === 'echo-review-fab') {
    console.log('🔄 Echo: Replacing review FAB with recording FAB');
    fabButton.remove();
    fabButton = null;
  }

  if (fabButton) {
    console.log('📌 Echo: Recording FAB already exists');
    return;
  }

  console.log('📌 Echo: Creating recording FAB button');
  fabButton = document.createElement('button');
  fabButton.id = 'echo-fab';
  fabButton.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
    cursor: pointer;
    z-index: 999996;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: bold;
  `;

  const updateBadge = () => {
    const count = allAppThreads.length;
    fabButton.innerHTML = count > 0 ? `<div style="position: relative;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div style="position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 11px; min-width: 18px; text-align: center;">${count}</div></div>` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  };

  updateBadge();

  fabButton.addEventListener('mouseenter', () => {
    fabButton.style.transform = 'scale(1.1)';
    fabButton.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.5)';
  });

  fabButton.addEventListener('mouseleave', () => {
    fabButton.style.transform = 'scale(1)';
    fabButton.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.4)';
  });

  fabButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCommentsPanel();
  });

  document.body.appendChild(fabButton);
  console.log('✅ Echo: Recording FAB button added to DOM');
}

function hideFAB() {
  console.log('🔽 Echo: Hiding FAB button', !!fabButton);
  if (fabButton) {
    fabButton.remove();
    fabButton = null;
    console.log('✅ Echo: FAB button hidden');
  } else {
    console.log('⚠️ Echo: No FAB button to hide');
  }
}

function toggleCommentsPanel() {
  if (commentsPanelOpen) {
    hideCommentsPanel();
  } else {
    showCommentsPanel();
  }
}

function showCommentsPanel() {
  if (commentsPanel) return;

  commentsPanelOpen = true;

  commentsPanel = document.createElement('div');
  commentsPanel.id = 'echo-panel';
  commentsPanel.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
    z-index: 999998;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease-out;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);

  renderCommentsPanelContent();
  document.body.appendChild(commentsPanel);
}

function renderCommentsPanelContent() {
  if (!commentsPanel) return;

  const filteredThreads = showResolvedComments
    ? allAppThreads
    : allAppThreads.filter(t => t.status !== 'resolved');

  const openCount = allAppThreads.filter(t => t.status !== 'resolved').length;
  const resolvedCount = allAppThreads.filter(t => t.status === 'resolved').length;
  const currentPageCount = existingThreads.length;
  const totalCount = allAppThreads.length;

  commentsPanel.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb; background: #0f172a; color: white;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: 600;">All Comments</h2>
        <button id="echo-panel-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">×</button>
      </div>
      <div style="font-size: 13px; opacity: 0.9;">${totalCount} total · ${openCount} open · ${resolvedCount} resolved</div>
      <div style="font-size: 12px; opacity: 0.75; margin-top: 4px;">${currentPageCount} on this page</div>
    </div>

    <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
      <div style="display: flex; gap: 8px;">
        <button id="echo-filter-all" style="flex: 1; padding: 8px 12px; border: ${showResolvedComments ? '2px solid #0f172a' : '1px solid #e5e7eb'}; background: ${showResolvedComments ? '#f8fafc' : 'white'}; color: ${showResolvedComments ? '#0f172a' : '#64748b'}; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
          All (${totalCount})
        </button>
        <button id="echo-filter-open" style="flex: 1; padding: 8px 12px; border: ${!showResolvedComments ? '2px solid #0f172a' : '1px solid #e5e7eb'}; background: ${!showResolvedComments ? '#f8fafc' : 'white'}; color: ${!showResolvedComments ? '#0f172a' : '#64748b'}; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
          Open (${openCount})
        </button>
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 16px;" id="echo-threads-container">
      ${filteredThreads.length === 0 ?
        `<div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
          <div style="font-size: 48px; margin-bottom: 16px;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">No comments yet</div>
          <div style="font-size: 14px;">Click on any element to add feedback</div>
        </div>`
        :
        filteredThreads.map(thread => createThreadCard(thread)).join('')
      }
    </div>

    <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: #f9fafb;">
      <button id="echo-stop-recording" style="width: 100%; background: #EF4444; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s;">
        Stop Recording
      </button>
    </div>
  `;

  commentsPanel.querySelector('#echo-panel-close').addEventListener('click', hideCommentsPanel);
  commentsPanel.querySelector('#echo-stop-recording').addEventListener('click', handleStopFromPanel);

  commentsPanel.querySelector('#echo-filter-all').addEventListener('click', () => {
    showResolvedComments = true;
    renderCommentsPanelContent();
  });

  commentsPanel.querySelector('#echo-filter-open').addEventListener('click', () => {
    showResolvedComments = false;
    renderCommentsPanelContent();
  });

  filteredThreads.forEach((thread) => {
    const card = commentsPanel.querySelector(`[data-thread-id="${thread.id}"]`);
    if (card) {
      card.addEventListener('click', () => scrollToThread(thread));
    }
  });
}

function createThreadCard(thread) {
  const status = thread.status || 'open';
  const commentCount = thread.comments?.length || 0;
  const firstCommentObj = thread.comments?.[0];
  const firstComment = firstCommentObj?.content || firstCommentObj?.text || 'No comment text';
  const firstAuthor = firstCommentObj?.author;
  const authorName = firstAuthor?.full_name || firstAuthor?.email?.split('@')[0] || 'Unknown';
  const createdAt = new Date(thread.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isCurrentPage = thread.page_url === window.location.href;
  let pageDisplay = '';

  if (!isCurrentPage && thread.page_url) {
    try {
      const url = new URL(thread.page_url);
      const pathname = url.pathname === '/' ? 'Home' : url.pathname.split('/').filter(Boolean).pop() || 'Page';
      pageDisplay = `<div style="color: #64748b; font-size: 11px; margin-top: 8px; display: flex; align-items: center; gap: 4px;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pathname}</span>
      </div>`;
    } catch (e) {
      pageDisplay = '';
    }
  }

  return `
    <div data-thread-id="${thread.id}" data-page-url="${thread.page_url || ''}" style="
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
      ${!isCurrentPage ? 'opacity: 0.85;' : ''}
    " onmouseenter="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; this.style.borderColor='#3B82F6';" onmouseleave="this.style.boxShadow='none'; this.style.borderColor='#e5e7eb';">

      <div style="display: flex; align-items: start; gap: 10px;">
        <div style="width: 32px; height: 32px; background: #0f172a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0;">
          ${authorName.charAt(0).toUpperCase()}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${authorName}</span>
            <span style="color: #94a3b8; font-size: 11px;">${createdAt}</span>
          </div>
          <div style="font-size: 13px; color: #475569; line-height: 1.4; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${firstComment}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
        <span style="
          background: ${status === 'resolved' ? '#10B981' : '#3B82F6'};
          color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        ">${status}</span>
            <span style="color: #64748b; font-size: 11px; display: flex; align-items: center;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 3px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}
            </span>
      </div>
      ${pageDisplay}
      </div>
      </div>
    </div>
  `;
}

function scrollToThread(thread) {
  const isCurrentPage = thread.page_url === window.location.href;

  if (!isCurrentPage) {
    if (confirm(`This comment is on a different page. Navigate to that page?\n\n${thread.page_url}`)) {
      window.location.href = thread.page_url;
    }
    return;
  }

  hideCommentsPanel();

  const pin = document.querySelector(`.echo-pin[data-thread-id="${thread.id}"]`);
  if (pin) {
    pin.scrollIntoView({ behavior: 'smooth', block: 'center' });

    pin.style.animation = 'pulse 0.5s ease-in-out 3';
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      pin.click();
    }, 1000);
  } else {
    showNotification('Comment pin not found on this page', 'error');
  }
}

function hideCommentsPanel() {
  if (commentsPanel) {
    commentsPanel.style.animation = 'slideOut 0.3s ease-in';
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      commentsPanel.remove();
      commentsPanel = null;
      commentsPanelOpen = false;
    }, 300);
  }
}

function refreshCommentsPanel() {
  if (commentsPanelOpen && commentsPanel) {
    renderCommentsPanelContent();
  }

  if (fabButton) {
    const count = allAppThreads.length;
    fabButton.innerHTML = count > 0 ? `<div style="position: relative;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div style="position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 11px; min-width: 18px; text-align: center;">${count}</div></div>` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  }
}

function handleStopFromPanel() {
  console.log('🛑 Echo: User clicked stop recording in panel');
  if (confirm('Are you sure you want to stop recording feedback?')) {
    console.log('✅ Echo: User confirmed stop recording');

    // Do cleanup locally first
    console.log('🧹 Echo: Starting local cleanup');
      isEchoActive = false;
      activeSession = null;
      clearAllPins();
      hideFAB();
      hideCommentsPanel();

    // Reset cursor - try multiple approaches
      document.body.style.cursor = '';
    document.body.style.removeProperty('cursor');
    document.documentElement.style.cursor = '';
    document.documentElement.style.removeProperty('cursor');

    // Close any open thread viewers
    const existingViewers = document.querySelectorAll('.echo-thread-viewer');
    existingViewers.forEach(viewer => viewer.remove());
    console.log('✅ Echo: Local cleanup complete');

    // Notify background script
    chrome.runtime.sendMessage({ type: 'STOP_SESSION', tabId: null }, () => {
      console.log('📤 Echo: Sent STOP_SESSION to background');
      showNotification('Recording stopped', 'success');
    });
  }
}
