/**
 * Returns the appropriate database URL for the current environment.
 *
 * In Vercel Preview Deployments, reads VERCEL_GIT_COMMIT_REF to find
 * a branch-specific DATABASE_URL_<SANITIZED_BRANCH> env var.
 * Falls back to DATABASE_URL for production and local dev.
 *
 * Branch sanitization: feat/mn-cafe-profiles → DATABASE_URL_FEAT_MN_CAFE_PROFILES
 */
export function getDatabaseUrl(): string {
  const branchRef = process.env.VERCEL_GIT_COMMIT_REF;
  if (branchRef && branchRef !== "main") {
    const sanitized = branchRef.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    const branchUrl = process.env[`DATABASE_URL_${sanitized}`];
    if (branchUrl) return branchUrl;
  }
  return process.env.DATABASE_URL!;
}
