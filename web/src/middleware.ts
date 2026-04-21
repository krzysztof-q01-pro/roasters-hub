import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/dashboard(.*)"]);

const isLocaleFreeRoute = createRouteMatcher([
  "/admin(.*)",
  "/api(.*)",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  if (!isLocaleFreeRoute(req)) {
    return intlMiddleware(req);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
