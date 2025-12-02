# Echo Platform Roadmap

## 🎯 Vision
Transform Echo from a screenshot-based feedback tool into a **live, interactive feedback platform** where comments are tied directly to DOM elements and reviewers can see feedback in real-time on the actual page.

---

## 📅 Development Phases

### ✅ Phase 0: Foundation (COMPLETED)
- [x] Chrome Extension with comment capture
- [x] Dashboard for viewing comments
- [x] Screenshot capture with comments
- [x] DOM selector storage for element tracking
- [x] Workspace and app management
- [x] User authentication and roles
- [x] Shared apps via collaborators

---

### 🚧 Phase 1: Live Page Commenting (IN PROGRESS)
**Goal:** Comments appear on actual DOM elements when viewing the page

#### 1.1 Extension Reviewer Mode
- [ ] Auto-detect when user is on an app's URL
- [ ] Fetch all comments for current page
- [ ] Attach comment pins to DOM elements using stored selectors
- [ ] Smart element matching with fallback to position
- [ ] Real-time comment updates via Supabase subscriptions
- [ ] Reply to comments directly on the page

#### 1.2 Dashboard Live Preview (Option C)
- [x] Embed target website in iframe
- [x] Show comment pins on actual page elements
- [x] Handle cross-origin restrictions with DOM snapshot fallback
- [x] Three view modes: Screenshot, Live, DOM Snapshot
- [x] Auto-detect when iframe is blocked
- [ ] Interactive page navigation within dashboard

#### 1.3 Smart Element Matching
- [ ] Exact CSS selector matching
- [ ] Partial selector fallback (parent elements)
- [ ] Position-based fallback with tolerance
- [ ] Handle dynamic content (SPA navigation)
- [ ] MutationObserver for DOM changes

**Estimated Completion:** 1-2 weeks

---

### 📋 Phase 2: Enhanced Context Capture
**Goal:** Capture rich context with every comment for better debugging

#### 2.1 Device Information
- [ ] Browser name and version
- [ ] Operating system
- [ ] Screen resolution and viewport size
- [ ] Device type (desktop/tablet/mobile)
- [ ] Pixel ratio for retina displays
- [ ] Touch capability detection

#### 2.2 Console Logs
- [ ] Capture console.log, warn, error messages
- [ ] Timestamp each log entry
- [ ] Filter sensitive information
- [ ] Show logs in comment thread
- [ ] Highlight errors related to commented element

#### 2.3 Network Requests
- [ ] Capture failed API calls (4xx, 5xx)
- [ ] Record request/response headers
- [ ] Show timing information
- [ ] Filter by domain (app's API only)
- [ ] Correlate with user actions

**Estimated Completion:** 2-3 weeks

---

### 🎨 Phase 3: Visual Annotations
**Goal:** Allow users to draw on the page to highlight issues

#### 3.1 Drawing Tools
- [ ] Freehand drawing (pen tool)
- [ ] Rectangle highlight
- [ ] Arrow pointer
- [ ] Text annotations
- [ ] Color picker
- [ ] Undo/redo support

#### 3.2 Annotation Storage
- [ ] Store annotations as SVG paths
- [ ] Link annotations to comments
- [ ] Render annotations on page load
- [ ] Export annotations with screenshots

**Estimated Completion:** 2 weeks

---

### 🎥 Phase 4: Session Recording
**Goal:** Record user sessions with synchronized comments

#### 4.1 Session Capture
- [ ] Record DOM changes (rrweb integration)
- [ ] Capture mouse movements and clicks
- [ ] Record scroll position over time
- [ ] Compress and store recordings efficiently
- [ ] Privacy-safe recording (mask sensitive data)

#### 4.2 Session Playback
- [ ] Timeline-based playback in dashboard
- [ ] Show comments at exact timestamp
- [ ] Speed controls (0.5x, 1x, 2x)
- [ ] Jump to comment timestamp
- [ ] Export as video (optional)

#### 4.3 Session Analytics
- [ ] Heatmaps from recorded sessions
- [ ] Click tracking visualization
- [ ] Rage click detection
- [ ] Dead click detection

**Estimated Completion:** 4-6 weeks

---

### 🔗 Phase 5: Integrations
**Goal:** Connect Echo with existing workflows

#### 5.1 Issue Trackers
- [x] Jira integration (basic)
- [ ] Jira two-way sync
- [ ] Linear integration
- [ ] GitHub Issues
- [ ] Asana integration
- [ ] Trello integration

#### 5.2 Communication
- [ ] Slack notifications
- [ ] Discord webhooks
- [ ] Email digests
- [ ] Microsoft Teams

#### 5.3 Design Tools
- [ ] Figma plugin (view comments on designs)
- [ ] Import designs for comparison

**Estimated Completion:** 3-4 weeks

---

### 🌐 Phase 6: Embeddable Widget
**Goal:** Allow any website to embed Echo without extension

#### 6.1 JavaScript SDK
- [ ] Lightweight embed script (<50KB)
- [ ] No-code installation
- [ ] Customizable appearance
- [ ] White-label option
- [ ] Guest commenting support

#### 6.2 Widget Features
- [ ] Comment anywhere on page
- [ ] View existing comments
- [ ] Real-time updates
- [ ] Mobile-responsive
- [ ] Keyboard shortcuts

**Estimated Completion:** 3-4 weeks

---

## 🏗️ Technical Architecture

### Current Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Extension:** Chrome Manifest V3
- **Hosting:** Vercel

### Planned Additions
- **Session Recording:** rrweb library
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage for recordings
- **Edge Functions:** Supabase Edge Functions for processing

---

## 📊 Success Metrics

| Metric | Current | Phase 1 Target | Phase 4 Target |
|--------|---------|----------------|----------------|
| Comment accuracy | 70% | 95% | 98% |
| Page load time | N/A | <500ms | <300ms |
| Recording size | N/A | N/A | <1MB/min |
| User satisfaction | TBD | 4.0/5 | 4.5/5 |

---

## 🔄 Version History

| Version | Date | Features |
|---------|------|----------|
| 1.0.0 | Nov 2024 | Initial release with screenshot-based comments |
| 2.0.0 | Nov 2024 | Workspace management, shared apps |
| 2.1.0 | Dec 2024 | Screenshot capture fix, shared apps in extension |
| 3.0.0 | TBD | Live page commenting (Phase 1) |
| 4.0.0 | TBD | Session recording (Phase 4) |

---

## 📝 Notes

### Design Principles
1. **Non-intrusive:** Comments should not break the target website
2. **Fast:** Loading comments should be imperceptible
3. **Accurate:** Comments should always appear on the right element
4. **Private:** Never capture sensitive user data
5. **Accessible:** Support keyboard navigation and screen readers

### Known Limitations
- Cross-origin iframes cannot be annotated
- Some SPAs may require page refresh for comment sync
- Shadow DOM elements need special handling
- Service workers may interfere with network capture

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

*Last Updated: December 1, 2024*

