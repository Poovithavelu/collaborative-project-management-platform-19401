This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth-enabled Frontend

This app includes:
- Login: `/login` (calls POST `/auth/login`, stores JWT token in a safe dev cookie if backend doesn't set HttpOnly cookie)
- Register: `/register` (calls POST `/auth/register`, redirects to `/dashboard` on success)
- Protected Dashboard: `/dashboard` (server-side route guard redirects to `/login` if no JWT)
- Dashboard Navbar: shows user info from `/auth/me` and has logout action
- Server actions for `loginAction`, `registerAction`, `logoutAction`
- Projects list and creation via `listProjects` and `createProjectAction`

Route Guard:
- Implemented with `requireAuth()` in server-side layouts/pages under `/dashboard`. If unauthenticated, it performs a server redirect to `/login`.

Token Handling:
- Preferred: Backend sets HttpOnly cookie. Frontend fetches `/auth/me` with `credentials: "include"`.
- Dev fallback: If backend returns `{ access_token }` in JSON only, we set a non-HttpOnly cookie named by `AUTH_COOKIE_NAME` to allow Authorization header fallback.

The dashboard layout calls `/auth/me` on the backend to get the current user and org context. The dashboard page lists projects scoped to the user's active organization using:
- GET `/projects` to fetch all projects in active org
- POST `/projects` to create a new project (Create Project modal)

### Environment

Copy `.env.example` to `.env.local` and set the values:
```
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_NAME=collabtask_session

# CI/build toggle to skip outbound API calls during `next build`
DISABLE_API_DURING_BUILD=true
```

The backend should set an HttpOnly JWT cookie on successful login/registration. For development, if the backend only returns a token in the JSON body, a non-HttpOnly cookie fallback is used.

### Backend API

Expected endpoints (FastAPI):
- POST `/auth/register` with JSON: `{ "email": string, "password": string, "full_name": string|null, "org_name": string }`
- POST `/auth/login` with JSON: `{ "email": string, "password": string }`
- GET `/auth/me` (reads JWT from cookie or Authorization header)
- POST `/auth/logout` (optional)
- GET `/projects`
- POST `/projects` with JSON: `{ "name": string, "description": string|null }`

Ensure the backend is running at `NEXT_PUBLIC_BACKEND_API_URL`.

## Getting Started

Run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
