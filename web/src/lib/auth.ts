import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Ensure a UserProfile exists in the DB for the given Clerk user.
 * Creates on first call (lazy bootstrap), updates email/role on subsequent calls.
 */
async function ensureUserProfile(
  userId: string,
  email: string,
  role: "ADMIN" | "ROASTER",
) {
  const { db } = await import("@/lib/db");
  await db.userProfile.upsert({
    where: { id: userId },
    update: { email, role },
    create: { id: userId, email, role },
  });
}

/**
 * Require the caller to be an authenticated ADMIN.
 * Throws if not authenticated or role !== ADMIN.
 * Auto-creates UserProfile in DB on first call.
 * Returns the Clerk userId.
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: not signed in");
  }

  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "ADMIN") {
    throw new Error("Forbidden: admin role required");
  }

  await ensureUserProfile(userId, user.emailAddresses[0]?.emailAddress ?? "", "ADMIN");

  return userId;
}

/**
 * Require the caller to be the owner of a specific roaster.
 * Returns the Clerk userId.
 */
export async function requireRoasterOwner(roasterId: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: not signed in");
  }

  // Lazy import to avoid circular dependency
  const { db } = await import("@/lib/db");
  const profile = await db.userProfile.findUnique({
    where: { id: userId },
    select: { roasterId: true },
  });

  if (!profile || profile.roasterId !== roasterId) {
    throw new Error("Forbidden: not the owner of this roaster");
  }

  return userId;
}
