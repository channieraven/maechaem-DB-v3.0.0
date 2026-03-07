/**
 * Root layout
 *
 * Required environment variables (set in .env.local):
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 *   CLERK_SECRET_KEY
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mae Chaem Agroforestry DB",
  description: "ระบบฐานข้อมูลโครงการปลูกป่าอเนกประสงค์ในพื้นที่คทช. แม่แจ่ม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* Sarabun — Thai/Latin humanist sans-serif from Google Fonts.
            Loaded at runtime by the browser; weights 300–700 cover all UI. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
        />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <div className="flex min-h-screen flex-col">
            <header role="banner" className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
              <Link
                href="/"
                className="font-semibold text-gray-800 text-lg hover:opacity-75 transition-opacity"
              >
                🌳 Mae Chaem Agroforestry DB
              </Link>
              <nav className="flex items-center gap-4">
                <Show when="signed-out">
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                      เข้าสู่ระบบ
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors">
                      สมัครสมาชิก
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    Dashboard
                  </Link>
                  <UserButton />
                </Show>
              </nav>
            </header>
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
