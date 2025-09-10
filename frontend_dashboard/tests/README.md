# E2E Tests (Playwright)

This folder contains end-to-end tests covering core flows:
- Auth: register, login, route guard, logout
- Projects: create/list/navigate
- Tasks: create/edit
- Comments: create

Quickstart:
1) Ensure the backend API is running and reachable at NEXT_PUBLIC_BACKEND_API_URL (see ../README.md Environment).
2) Install deps and Playwright browsers:
   npm install
   npx playwright install --with-deps
3) Run the tests with a dev server auto-start:
   npm run e2e:dev

Environment:
- BASE_URL: Frontend base URL (default http://localhost:3000).
- NEXT_PUBLIC_BACKEND_API_URL: Backend API base URL for the app during tests.

CI note:
- Prefer running tests against next dev (npm run e2e:dev) to avoid build-time API calls.
- In CI, you can use:
  npm run e2e:ci
  which installs browsers and starts next dev automatically before executing tests.
- If you must run next build for other steps, set DISABLE_API_DURING_BUILD=true to skip outbound API calls during build, and ensure the backend is reachable to prevent timeouts. The config also sets a conservative staticGenerationTimeout to fail fast instead of hanging indefinitely.
