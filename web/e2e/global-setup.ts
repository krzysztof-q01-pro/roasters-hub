import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local if it exists
config({ path: resolve(process.cwd(), ".env.local") });

/**
 * Global setup — runs once before all tests.
 * Verifies environment and optionally checks database connectivity.
 */
async function globalSetup() {
  console.log("[E2E Global Setup] Verifying environment...");

  // Check base URL
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
  console.log(`[E2E Global Setup] Base URL: ${baseURL}`);

  // Warn if DATABASE_URL is missing (some tests may need it)
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[E2E Global Setup] Warning: DATABASE_URL not set. Tests requiring DB will be skipped."
    );
  }

  console.log("[E2E Global Setup] Complete");
}

export default globalSetup;
