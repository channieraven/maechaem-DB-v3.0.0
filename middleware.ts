/**
 * Clerk middleware — runs on every request matched by `config.matcher`.
 *
 * Public routes (no sign-in required):
 *   /              — landing page
 *   /sign-in       — Clerk-hosted sign-in
 *   /sign-up       — Clerk-hosted sign-up
 *   /api/plots     — GeoJSON data (also consumed by the client-side map)
 *   /api/webhooks  — Clerk webhook endpoint (verified by Svix signature)
 *
 * All other routes, including /dashboard, are protected and redirect
 * unauthenticated visitors to the sign-in page.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/plots(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, but always run for HTML pages.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
