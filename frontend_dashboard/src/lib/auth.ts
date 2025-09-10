"use server";

/**
 * Authentication helpers and server actions.
 *
 * PUBLIC_INTERFACE functions in this file:
 * - getCurrentUser
 * - requireAuth
 * - loginAction
 * - registerAction
 * - logoutAction
 *
 * These functions use the backend FastAPI JWT endpoints and a dev fallback cookie.
 */

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
};

type LoginResponse = {
  access_token?: string;
  token_type?: string;
};

type RegisterResponse = {
  id?: string;
  email?: string;
  access_token?: string;
  token_type?: string;
};

/**
 * Shape returned by backend /auth/me based on OpenAPI UserProfile schema.
 */
type Membership = {
  org_id: string;
  org_name: string;
  role: string;
};

type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
  active_org_id?: string | null;
  memberships?: Membership[];
};

// PUBLIC_INTERFACE
export async function getCurrentUser(): Promise<AuthUser | null> {
  /**
   * Try to fetch /auth/me with cookies included (backend should read HttpOnly cookie).
   * If that fails with 401 in certain dev setups where only a token cookie exists as a non-HttpOnly cookie,
   * send Authorization header using the dev cookie as a fallback.
   * During build phase, apiRequest returns a skipped-call error; treat as unauthenticated.
   */
  // First try without explicit Authorization.
  const first = await apiRequest<UserProfile>("/auth/me", { method: "GET" });
  if (first.ok && first.data) {
    const d = first.data;
    return {
      id: d.id ?? "",
      email: d.email ?? "",
      name: (d.full_name ?? undefined) as string | undefined,
      org_id: (d.active_org_id ?? null) as string | null,
    };
  } else if (first.error === "Skipped external API call during build phase") {
    return null;
  }

  // Fallback: if a non-HttpOnly cookie exists, forward it as Bearer.
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token) {
    const withHeader = await apiRequest<UserProfile>("/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (withHeader.ok && withHeader.data) {
      const d = withHeader.data;
      return {
        id: d.id ?? "",
        email: d.email ?? "",
        name: (d.full_name ?? undefined) as string | undefined,
        org_id: (d.active_org_id ?? null) as string | null,
      };
    }
    if (withHeader.error === "Skipped external API call during build phase") {
      return null;
    }
  }

  return null;
}

// PUBLIC_INTERFACE
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// PUBLIC_INTERFACE
export async function loginAction(_: unknown, formData: FormData) {
  "use server";

  // Avoid external calls during build
  if ((process.env.NEXT_PHASE || "").includes("build")) {
    return { error: "Login disabled during build." };
  }

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

  // If backend returns token (non-HttpOnly) also store as a fallback cookie for dev.
  const token = res.data?.access_token;
  if (token) {
    cookies().set(COOKIE_NAME, token, {
      httpOnly: false, // Prefer HttpOnly set by backend; this is a dev fallback.
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

  // Avoid external calls during build
  if ((process.env.NEXT_PHASE || "").includes("build")) {
    return { error: "Registration disabled during build." };
  }

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

  // Backend RegisterRequest expects: email, password, full_name (optional), org_name (required).
  // For a simple UX, we use the user's name as full_name and derive org_name as "<name>'s Org".
  const orgName = `${name}'s Org`;

  const res = await apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: { email, password, full_name: name, org_name: orgName },
  });

  if (!res.ok) {
    return { error: res.error || "Registration failed." };
  }

  // Optional: some backends auto-login and set cookie; if token present, set fallback cookie for dev.
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

  // Clear local dev cookie fallback
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });

  // Avoid external calls during build
  if (!(process.env.NEXT_PHASE || "").includes("build")) {
    // Try backend logout if available (ignore errors)
    await apiRequest<unknown>("/auth/logout", { method: "POST" });
  }

  redirect("/login");
}
