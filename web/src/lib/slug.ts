import { db } from "./db";

/**
 * Generates a URL-safe slug from text.
 * "Hard Beans" → "hard-beans"
 * "Café Świeżo" → "cafe-swiezo"
 */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → dash
    .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
    .slice(0, 80); // reasonable max length
}

/**
 * Generates a unique roaster slug with collision handling.
 *
 * Strategy:
 *   "Hard Beans" + "Opole" → "hard-beans"
 *   collision → "hard-beans-opole"
 *   collision → "hard-beans-opole-2"
 *   collision → "hard-beans-opole-3"
 */
export async function generateUniqueSlug(
  name: string,
  city: string,
): Promise<string> {
  const baseSlug = slugify(name);
  const citySlug = slugify(city);

  // Try: "hard-beans"
  if (!(await slugExists(baseSlug))) {
    return baseSlug;
  }

  // Try: "hard-beans-opole"
  const withCity = `${baseSlug}-${citySlug}`;
  if (!(await slugExists(withCity))) {
    return withCity;
  }

  // Try: "hard-beans-opole-2", "hard-beans-opole-3", ...
  let counter = 2;
  while (counter <= 100) {
    const candidate = `${withCity}-${counter}`;
    if (!(await slugExists(candidate))) {
      return candidate;
    }
    counter++;
  }

  throw new Error(`Cannot generate unique slug for "${name}" in "${city}"`);
}

async function slugExists(slug: string): Promise<boolean> {
  const count = await db.roaster.count({ where: { slug } });
  return count > 0;
}
