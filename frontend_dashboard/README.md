This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth-enabled Frontend

This app includes:
- Login: `/login`
- Register: `/register`
- Protected Dashboard: `/dashboard` (server-side redirect to `/login` if unauthenticated)
- Server actions for `loginAction`, `registerAction`, `logoutAction`, and `switchOrgAction`
- Dashboard header shows current user and active organization and provides an "Switch org" menu (when memberships are provided by the backend).

The dashboard layout calls `/auth/me` on the backend to get the current user profile, memberships, and active org context.

### Environment

Copy `.env.example` to `.env.local` and set the values:
```
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_NAME=collabtask_session
```

The backend should set an HttpOnly JWT cookie on successful login/registration and when switching orgs. For development, if the backend also returns a token in the JSON body, a non-HttpOnly cookie fallback is used so calls to `/auth/me` succeed.

### Endpoints expected (FastAPI backend)
- POST `/auth/register` — create user and org; returns TokenResponse and sets cookie
- POST `/auth/login` — authenticate; returns TokenResponse and sets cookie
- GET `/auth/me` — current user profile; reads JWT from cookie
- POST `/auth/orgs/switch` — switch active org; returns TokenResponse and sets cookie

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
