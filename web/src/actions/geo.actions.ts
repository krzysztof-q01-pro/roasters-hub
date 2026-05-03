"use server";

import { headers } from "next/headers";

/**
 * Detects the user's country from Vercel's Edge Network headers.
 * Falls back gracefully when the header is unavailable (local dev, non-Vercel).
 *
 * x-vercel-ip-country is provided free by Vercel's Edge Network
 * and contains the ISO 3166-1 alpha-2 country code (e.g. "PL", "DE").
 */
export async function detectCountry(): Promise<{
  name: string;
  code: string;
} | null> {
  try {
    const headersList = await headers();
    const countryCode = headersList.get("x-vercel-ip-country");

    if (!countryCode) return null;

    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const name = regionNames.of(countryCode);

    if (!name || name === countryCode) return null;

    return { name, code: countryCode };
  } catch {
    return null;
  }
}
