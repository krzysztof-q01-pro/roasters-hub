import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/dashboard(.*)"]);

const isLocaleFreeRoute = createRouteMatcher([
  "/api(.*)",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

/**
 * BETA PASSWORD PROTECTION
 * ========================
 * Set BETA_PASSWORD env var to enable site-wide password gate.
 * Remove or leave empty to disable.
 * Cookie "beta_auth" lasts 24h.
 *
 * How to remove:
 * 1. Delete BETA_PASSWORD from env
 * 2. Delete this block (lines 25-54)
 * 3. Delete app/[locale]/password/page.tsx
 */
const BETA_PASSWORD = process.env.BETA_PASSWORD;

function isBetaExcluded(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    /\/(en|pl|de)\/password/.test(pathname) ||
    pathname === "/password" ||
    pathname.includes(".") || // static files
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  );
}

function checkBetaPassword(req: NextRequest) {
  if (!BETA_PASSWORD) return NextResponse.next();
  if (isBetaExcluded(req.nextUrl.pathname)) return NextResponse.next();

  const authCookie = req.cookies.get("beta_auth")?.value;
  if (authCookie === "1") return NextResponse.next();

  // Redirect to password gate
  const locale = req.nextUrl.pathname.split("/")[1];
  const safeLocale = ["pl", "de"].includes(locale) ? locale : "en";
  const redirectTo = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(
    new URL(`/${safeLocale}/password?redirect=${redirectTo}`, req.url)
  );
}

export default clerkMiddleware(async (auth, req) => {
  // Beta gate first
  const betaResponse = checkBetaPassword(req);
  if (betaResponse.status !== 200) return betaResponse;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  const isStaticFile = /\.[a-zA-Z0-9]+$/.test(req.nextUrl.pathname);
  if (!isLocaleFreeRoute(req) && !isStaticFile) {
    return intlMiddleware(req);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|ogg|mp3|wav)).*)",
    "/(api|trpc)(.*)",
  ],
};
