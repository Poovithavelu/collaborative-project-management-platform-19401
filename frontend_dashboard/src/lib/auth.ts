"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "./api";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "collabtask_session";
const COOKIE_SECURE = (process.env.AUTH_COOKIE_SECURE || "false").toLowerCase() === "true";
const COOKIE_SAMESITE = (process.env.AUTH_COOKIE_SAMESITE as "lax" | "strict" | "none") || "lax";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  org_id?: string | null;
  // When available from backend /auth/me
  memberships?: Array<{ org_id: string; org_name: string; role: string }>;
};

type LoginResponse = {
  access_token?: string;
  token_type?: string;
  user_id?: string;
  active_org_id?: string | null;
};

type RegisterResponse = {
  id?: string;
  email?: string;
  access_token?: string;
  token_type?: string;
  user_id?: string;
  active_org_id?: string | null;
};

// PUBLIC_INTERFACE
export async function getCurrentUser(): Promise<AuthUser | null> {
  /**
   * Calls the backend /auth/me endpoint to retrieve the authenticated user profile.
   * The backend should read the JWT from an HttpOnly cookie. For development,
   * we also send the non-HttpOnly fallback cookie if present via standard fetch cookies.
   */
  const res = await apiRequest<AuthUser>("/auth/me", {
    method: "GET",
  });

  if (!res.ok) {
    return null;
  }
  return res.data || null;
}

// PUBLIC_INTERFACE
export async function requireAuth() {
  /**
   * Ensures a user is authenticated; redirects to /login when not authenticated.
   * Use this in protected server components/layouts.
   */
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// PUBLIC_INTERFACE
export async function loginAction(_: unknown, formData: FormData) {
  "use server";
  /**
   * Submits credentials to backend /auth/login.
   * On success:
   * - Prefer backend-set HttpOnly auth cookie.
   * - For development, if a token is returned, set a non-HttpOnly cookie as fallback.
   * Redirects to /dashboard.
   */
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const res = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!res.ok) {
    return { error: res.error || "Login failed." };
  }

  // Dev fallback cookie if token provided in JSON
  const token = res.data?.access_token;
  if (token) {
    cookies().set(COOKIE_NAME, token, {
      httpOnly: false, // Prefer HttpOnly set by backend in production
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  redirect("/dashboard");
}

// PUBLIC_INTERFACE
export async function registerAction(_: unknown, formData: FormData) {
  "use server";
  /**
   * Registers a user via /auth/register. The backend may also create an org and membership.
   * On success, rely on backend HttpOnly cookie; set dev fallback if token is returned.
   * Redirects to /dashboard.
   */
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const res = await apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: { full_name: name, email, password, org_name: `${name.split(" ")[0] || "My"} Org` },
  });

  if (!res.ok) {
    return { error: res.error || "Registration failed." };
  }

  // Dev fallback cookie if token provided in JSON
  const token = res.data?.access_token;
  if (token) {
    cookies().set(COOKIE_NAME, token, {
      httpOnly: false,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  redirect("/dashboard");
}

// PUBLIC_INTERFACE
export async function logoutAction() {
  "use server";
  /**
   * Logs out user. Clears dev fallback cookie and calls backend logout if available.
   */
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });

  // Try backend logout if available (ignore errors)
  await apiRequest<unknown>("/auth/logout", { method: "POST" });

  redirect("/login");
}

// PUBLIC_INTERFACE
export async function switchOrgAction(_: unknown, formData?: FormData) {
  "use server";
  /**
   * Switch the user's active organization by calling /auth/orgs/switch, then redirect to /dashboard.
   * The backend should respond with a new token and set an HttpOnly cookie. We also
   * update the dev fallback cookie when a token is provided.
   */
  const org_id = String(formData?.get("org_id") || "").trim();
  if (!org_id) {
    return { error: "Organization ID is required." };
  }

  const res = await apiRequest<LoginResponse>("/auth/orgs/switch", {
    method: "POST",
    body: { org_id },
  });

  if (!res.ok) {
    return { error: res.error || "Failed to switch organization." };
  }

  const token = res.data?.access_token;
  if (token) {
    cookies().set(COOKIE_NAME, token, {
      httpOnly: false,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAMESITE,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  redirect("/dashboard");
}
