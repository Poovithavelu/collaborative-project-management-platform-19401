This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth-enabled Frontend

This app includes:
- Login: `/login`
- Register: `/register`
- Protected Dashboard: `/dashboard` (server-side redirect to `/login` if unauthenticated)
- Server actions for `loginAction`, `registerAction`, `logoutAction`
- Projects list and creation via `listProjects` and `createProjectAction`

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
