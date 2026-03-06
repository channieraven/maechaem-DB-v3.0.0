import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 🚀 เพิ่มบรรทัดนี้ลงไป เพื่อบอกให้รันบน Cloudflare Edge!
export const runtime = 'edge';

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
