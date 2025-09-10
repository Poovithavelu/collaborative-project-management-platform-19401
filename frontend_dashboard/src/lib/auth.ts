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

// PUBLIC_INTERFACE
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Fetch /auth/me; backend should read HttpOnly JWT from cookies.
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// PUBLIC_INTERFACE
export async function loginAction(_: unknown, formData: FormData) {
  "use server";
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
      httpOnly: false, // NOTE: Prefer HttpOnly set by backend. This is a dev fallback.
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
    body: { name, email, password },
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

  // Try backend logout if available (ignore errors)
  await apiRequest<unknown>("/auth/logout", { method: "POST" });

  redirect("/login");
}
