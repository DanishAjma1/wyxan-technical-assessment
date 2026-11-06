# Wyxan Mini Browser — Full-Stack Web Engineering Assessment

A full-featured mini web browser running inside a single React/Next.js tab, powered by a NestJS and MongoDB backend. It simulates an interconnected micro-web of custom-addressed `.zz` HTML pages with per-user navigation history, restore-on-return state preservation, full-text search, and live site publishing.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript, Zod, Lucide Icons
- **Backend:** NestJS 10, TypeScript, Mongoose / MongoDB, Zod
- **Package Manager:** `pnpm` workspace monorepo (`backend` and `frontend`)

---

## Core Features Implemented

1. **Browse Engine:**
   - Custom `.zz` address bar resolution (`tidepool.zz`, `observatory.zz`, `lantern.zz`, etc.) with Zod validation and normalization.
   - Graceful **"Nowhere" (404)** state when navigating to unregistered addresses (`atlantis.zz`, `phantom-reef.zz`, `lost-signal.zz`), complete with a one-click **"Publish at `<address>`"** action.
   - Intercepts internal `<a href="...">` link clicks inside rendered pages so navigation routes through the mini-browser engine without full-page reloads.

2. **Retrace System & State Preservation:**
   - Per-user local navigation stack (`stack: string[]`, `currentIndex: number`) with **Back** and **Forward** controls.
   - **Restore-on-Return State Preservation:** Automatically captures and restores scroll coordinates (`scrollX`, `scrollY`) and form field inputs (`<input>`, `<textarea>`, `<select>`) when returning to a page via Back/Forward.
   - Synchronizes all navigation actions (`typed`, `link`, `back`, `forward`) to MongoDB (`POST /history`) and displays both the session stack and chronological history log (`GET /history?user=username`) in the **Retrace & History Drawer**.

3. **Full-Text Search System:**
   - Queries `GET /sites/search?q=query` backed by MongoDB full-text indexing across site `title`, `address`, and `body` content.
   - Modal interface (`Cmd/Ctrl + K` or toolbar **Search** button) with live keyword highlighting across titles, addresses, and plain-text body snippets.

4. **Publishing Engine:**
   - Allows any selected user profile to claim a unique custom address, title, and raw HTML body (`POST /sites`).
   - Includes starter HTML templates, a live sandboxed `<iframe>` preview tab, strict client & server Zod validation, and author attribution.

5. **Security & Sandboxing:**
   - Renders third-party HTML inside an isolated `<iframe sandbox="allow-scripts">` (without `allow-same-origin`), preventing untrusted scripts from accessing parent DOM, cookies, or storage while communicating exclusively via structured `postMessage` events.

6. **User Profile Switcher:**
   - Top-bar profile selector (`Danish`, `Elena`, `Marcus`, `Sora`, plus ability to add new profiles) with isolated session stacks and persistent history per user.

---

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env` values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wyxan_mini_browser
PORT=4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Deterministic Seed Script

Seeds 4 user profiles (`Danish`, `Elena`, `Marcus`, `Sora`), 10 interconnected `.zz` sites (including dead links to test 404 Nowhere states), and 1 hour of chronological browsing history. Running `pnpm seed` multiple times is idempotent and produces the exact same database state:

```bash
pnpm seed
```

### 4. Start the Backend and Frontend

In two terminals (or concurrently):

```bash
# Terminal 1: Start NestJS API on http://localhost:4000
pnpm dev:backend

# Terminal 2: Start Next.js Client on http://localhost:3000
pnpm dev:frontend
```

OR

```bash
# Terminal 3: Start both NestJS API and Client in parallel
pnpm dev
```

### 5. Build & Run Tests

```bash
pnpm build
pnpm test
```

---

## Running with Docker Compose

A complete multi-service [`docker-compose.yml`](file:///home/danish-butt/Documents/personal-code-files/wyxan-technical-assessment/docker-compose.yml) is provided that starts MongoDB (`mongo:7`), runs the deterministic `pnpm seed` job once MongoDB is healthy, launches the NestJS backend (`:4000`), and starts the Next.js frontend (`:3000`):

```bash
# Build and start all services (MongoDB + Auto-Seed + Backend + Frontend)
docker compose up --build

# Or run only MongoDB in Docker while running Backend/Frontend locally:
docker compose up -d mongodb
```
