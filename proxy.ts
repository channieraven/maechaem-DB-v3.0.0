/**
 * Clerk authentication proxy (Next.js 16+ file convention: proxy.ts).
 *
 * Required environment variables (set in .env.local):
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 *   CLERK_SECRET_KEY
 *
 * Public routes (no sign-in required):
 *   /              — landing page
 *   /api/webhooks/* — Clerk webhook endpoints
 *
 * All other routes (including /dashboard and nested paths) are protected
 * and will redirect unauthenticated users to the Clerk sign-in page.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are publicly accessible without authentication.
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect every route that is NOT in the public list.
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  // Apply the middleware to all routes except Next.js internals and static
  // files that don't need authentication checks.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
