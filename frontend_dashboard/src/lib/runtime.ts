"use server";

/**
 * PUBLIC_INTERFACE
 * isApiDisabled: Returns true when external API calls should be disabled (e.g., during next build/CI).
 * This checks DISABLE_API_DURING_BUILD or NEXT_PHASE build indicator.
 */
export function isApiDisabled(): boolean {
  const phase = process.env.NEXT_PHASE || "";
  const byPhase = phase.includes("build");
  const byEnv = (process.env.DISABLE_API_DURING_BUILD || "").toLowerCase() === "true";
  return byPhase || byEnv;
}
