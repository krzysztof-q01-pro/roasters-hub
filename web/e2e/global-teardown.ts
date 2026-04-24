import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local if it exists
config({ path: resolve(process.cwd(), ".env.local") });

/**
 * Global teardown — runs once after all tests.
 * Note: DB cleanup is skipped in production environments.
 * For local tests with DB access, run cleanup manually or use TestDataFactory cleanup.
 */
async function globalTeardown() {
  console.log("[E2E Global Teardown] Complete");
}

export default globalTeardown;
