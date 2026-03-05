import Link from "next/link";
import { SignInButton, Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-bold leading-relaxed tracking-tight text-gray-900 dark:text-white">
        ระบบฐานข้อมูลโครงการปลูกป่าอเนกประสงค์
        <br />
        <span className="text-green-700">พื้นที่คทช. แม่แจ่ม</span>
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
        ระบบสารสนเทศเพื่อการบริหารจัดการข้อมูลแปลงปลูกป่าอเนกประสงค์
        <br />
        ในพื้นที่คทช. อ.แม่แจ่ม จ. เชียงใหม่
        <br />
        ส่วนวนวัฒนวิจัย สำนักวิจัยและพัฒนาการป่าไม้ กรมป่าไม้
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
  );
}
