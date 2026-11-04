# Project Context: Full Stack Web Engineering Test (Mini Browser)

## Overview
A mini web browser running inside a single React/Next.js tab, powered by a NestJS and MongoDB backend. It simulates a small web of custom-addressed HTML pages, complete with navigation history, search, and publishing capabilities.

## Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript
* **Backend:** NestJS, TypeScript, Mongoose / MongoDB
* **Data Seeding:** Deterministic seed script (idempotent)

## Core Features & Requirements
1. **Browse Engine:** Address bar resolution, handling valid pages and non-existent "Nowhere" (404) pages, following internal links (including broken ones).
2. **Retrace System:** Full Back, Forward, and chronological History log per user profile, with "restore on return" state preservation.
3. **Search System:** Full-text search across all published page bodies and titles in MongoDB.
4. **Publishing Engine:** Interface allowing users to register a unique address and publish raw HTML.
5. **Security / Sandboxing:** Secure rendering of untrusted third-party HTML via sandboxed `<iframe>` or strict sanitization to prevent XSS attacks.
6. **User Switcher:** Simple dropdown profile selector (no complex authentication/passkeys needed).

## Architectural Guidelines
* Clean separation of concerns between client state and server persistence.
* Strict input validation using Zod on both client and server boundaries.
* Idempotent seed script (`pnpm seed`) that guarantees identical database states across runs without duplication.
* Save the sensitive information to .env file and never commit this file in git but .env.example.
