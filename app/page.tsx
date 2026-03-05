import Link from "next/link";
import { SignInButton, UserButton, Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* ------------------------------------------------------------------ */}
      {/* Navbar                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          🌳 Mae Chaem Agroforestry DB
        </span>
        <nav className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline"
            >
              Dashboard
            </Link>
            <UserButton />
          </Show>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
          ระบบฐานข้อมูลโครงการปลูกป่าอเนกประสงค์
          <br />
          <span className="text-green-700">พื้นที่คทช. แม่แจ่ม</span>
        </h1>
        <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
          บริหารจัดการข้อมูลแปลงปลูกป่าและการใช้ที่ดินในโครงการวิจัย
          อโกรฟอเรสทรีแม่แจ่ม
        </p>
        <Show
          when="signed-out"
          fallback={
            <Link
              href="/dashboard"
              className="rounded-full bg-green-700 px-8 py-3 text-base font-semibold text-white hover:bg-green-800 transition-colors shadow"
            >
              ไปยัง Dashboard →
            </Link>
          }
        >
          <SignInButton mode="modal">
            <button className="rounded-full bg-green-700 px-8 py-3 text-base font-semibold text-white hover:bg-green-800 transition-colors shadow">
              เข้าสู่ระบบ
            </button>
          </SignInButton>
        </Show>
      </main>
    </div>
  );
}
