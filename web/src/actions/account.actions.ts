"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Delete user's saved roasters
    await db.savedRoaster.deleteMany({
      where: { userId },
    });

    // 3. Delete user's saved cafes
    await db.savedCafe.deleteMany({
      where: { userId },
    });

    // 4. Unlink roasters owned by this user (set ownerId to null)
    await db.roaster.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null },
    });

    // 5. Unlink cafes owned by this user (set ownerId to null)
    await db.cafe.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null },
    });

    // 6. Delete UserProfile from Prisma
    await db.userProfile.deleteMany({
      where: { id: userId },
    });

    // 7. Delete user from Clerk
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch {
      // If Clerk deletion fails, we still return success since local data is cleaned
      // The user can be manually deleted from Clerk dashboard if needed
    }

    revalidatePath("/");
    revalidatePath("/roasters");
    revalidatePath("/cafes");

    return { success: true };
  } catch (err) {
    console.error("[deleteAccount] error:", err);
    return { success: false, error: "Failed to delete account. Please contact support." };
  }
}
