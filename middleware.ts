/**
 * Clerk authentication middleware for Next.js App Router.
 *
 * - Public routes (/, /sign-in, /sign-up, and all static assets) are
 *   accessible without authentication.
 * - All other routes — including /dashboard — require a signed-in session.
 *   Unauthenticated requests are redirected to the sign-in page.
 *
 * Required environment variables (set in Netlify → Site settings →
 * Environment variables, or in .env.local for local development):
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 *   CLERK_SECRET_KEY
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
