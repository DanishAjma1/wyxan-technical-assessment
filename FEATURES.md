# CLAUDE.md: Full-Stack Mini Web Browser Implementation Guide

## GIT Branching
  * you need to create a new branch for each new feature and after commiting this feature push it to relative repository, create a PR on master, than continue the features building after creating a new branch from master with naming conventions: `feature/new-feature-name`, `update/feature-name` .

## Architectural Blueprint & Core Systems

### 1. The Server (NestJS + MongoDB)
* **Modules Required:** `SitesModule`, `UsersModule`, `HistoryModule`
* **Mongoose Schemas:**
  * **User:** `{ name: string }` (For browsing and publishing attribution)
  * **Site:** `{ address: string (unique, e.g. tidepool.zz), title: string, body: string (raw HTML), author: string, createdAt: Date }`
  * **Visit:** `{ userId: string, address: string, timestamp: Date, navigationType: 'typed' | 'link' | 'back' | 'forward' }`
* **API Endpoints:**
  * `GET /sites/:address` - Fetch site by address (returns 404 / "Nowhere" state if missing).
  * `POST /sites` - Publish a new site.
  * `GET /sites/search?q=query` - Full-text search across site titles and body content.
  * `POST /history` - Record a visit fact.
  * `GET /history?user=username` - Retrieve chronological visit history for a user profile.

### 2. The Client (Next.js / React Browser Chrome)
* **Browser Chrome UI:**
  * **User Profile Switcher:** Dropdown at the top selecting the active browsing user (e.g., "Current User: Danish").
  * **Toolbar:** Address bar, Back button, Forward button, History drawer toggle, Search modal/bar, Publish button/page.
* **Navigation & Retrace Engine:**
  * Manage local browser history stack (`stack: string[]`, `currentIndex: number`).
  * Implement Back & Forward behavior with "restore on return" state preservation (retaining scroll/form states).
  * Sync navigation actions to backend visit logging (`POST /history`).
* **Sandboxed HTML Rendering:**
  * Render untrusted third-party HTML safely using a sandboxed `<iframe>` or strict sanitization container (`sandbox="allow-scripts"` or DOMPurify) to prevent XSS attacks.
  * Intercept internal link (`<a>`) clicks within rendered pages to route them through the browser's address resolution engine instead of triggering full page reloads.

---

## Step-by-Step Execution Plan for Agent

### Phase 1: Backend Foundation & Database Models
1. Initialize MongoDB connection and Mongoose schemas (`User`, `Site`, `Visit`).
2. Implement NestJS services and controllers for Sites and History.
3. Build the deterministic seed script (`pnpm seed`) populating ~10 interconnected sites (including dead links to non-existent addresses), user profiles, and an hour of initial browsing history.

### Phase 2: Frontend Browser Shell & Navigation
1. Create the top browser toolbar layout with user switcher and address bar input.
2. Implement the client-side navigation state machine (history stack, pointer, Back/Forward controls, and backend synchronization).
3. Build the sandboxed rendering viewport with internal link click interception.

### Phase 3: Search, Publishing & Polish
1. Implement the Search modal/view querying `/sites/search` with keyword highlighting and direct click-through.
2. Implement the Publish view allowing any selected user profile to register an address, title, and raw HTML body.
3. Verify edge cases (e.g., navigating to non-existent addresses resulting in a clean "Nowhere / 404" state).
