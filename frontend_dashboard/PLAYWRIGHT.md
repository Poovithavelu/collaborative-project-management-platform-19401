# Playwright E2E Quickstart

This frontend includes Playwright tests for the core flows:
- Authentication (register, login, route guard, logout)
- Project creation, listing, navigation
- Task creation and editing
- Comment posting

Prereqs:
- Backend API up and reachable via NEXT_PUBLIC_BACKEND_API_URL (see README.md).
- Node 18+.

Install:
- npm install
- npx playwright install --with-deps

Run tests (dev server auto-start):
- npm run e2e:dev

Run against an already-running server:
- npm run dev
- npm run e2e

CI:
- Prefer npm run e2e:ci which installs browsers and starts next dev automatically.
- Ensure NEXT_PUBLIC_BACKEND_API_URL is set to a live backend.
- If your pipeline runs next build separately, set DISABLE_API_DURING_BUILD=true to skip outbound API calls during build.

Useful:
- Headed mode: npm run e2e:headed
- UI mode: npm run e2e:ui
- Report: npm run e2e:report
