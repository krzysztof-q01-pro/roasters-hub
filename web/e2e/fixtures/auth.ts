import { test as base, expect, Page } from "@playwright/test";
import { db } from "@/lib/db";

export type UserRole = "admin" | "roaster" | "cafe" | "guest";

interface TestUser {
  id: string;
  email: string;
  role: UserRole;
  token: string;
}

/**
 * Programmatic Clerk login via session token.
 * Requires CLERK_SECRET_KEY in environment.
 */
export async function loginAs(
  page: Page,
  role: UserRole
): Promise<TestUser | null> {
  if (role === "guest") return null;

  // In a real implementation, we would call Clerk's API to create
  // a session token. For now, we use a test-specific bypass.
  // TODO: Implement real Clerk session creation when E2E_CLERK_SECRET is available
  const testUsers: Record<Exclude<UserRole, "guest">, TestUser> = {
    admin: {
      id: "test-admin-id",
      email: "test-admin@beanmap.cafe",
      role: "admin",
      token: "test-admin-token",
    },
    roaster: {
      id: "test-roaster-id",
      email: "test-roaster@beanmap.cafe",
      role: "roaster",
      token: "test-roaster-token",
    },
    cafe: {
      id: "test-cafe-id",
      email: "test-cafe@beanmap.cafe",
      role: "cafe",
      token: "test-cafe-token",
    },
  };

  const user = testUsers[role];

  // Set the session cookie that Clerk expects
  // Note: In production, this would be a real JWT from Clerk
  await page.context().addCookies([
    {
      name: "__session",
      value: user.token,
      domain: new URL(page.url()).hostname || "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  return user;
}

/**
 * Logout by clearing cookies.
 */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
}

export { db };
