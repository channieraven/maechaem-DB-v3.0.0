import Link from "next/link";
import { SignInButton, Show } from "@clerk/nextjs";

const features = [
  {
    icon: "🗺️",
    title: "แผนที่แปลงปลูกป่า",
    description:
      "ดูแผนที่แบบโต้ตอบแสดงขอบเขตแปลงปลูกป่าทั้งหมดในพื้นที่คทช. แม่แจ่ม พร้อมข้อมูลรายแปลง",
    href: "/dashboard",
  },
  {
    icon: "📋",
    title: "ข้อมูลแปลงเกษตร",
    description:
      "ค้นหาและเรียกดูข้อมูลแปลงเกษตร เช่น รหัสแปลง ชื่อเกษตรกร พื้นที่ ตำบล และระดับความสูง",
    href: "/dashboard",
  },
  {
    icon: "📊",
    title: "สถิติและรายงาน",
    description:
      "สรุปจำนวนแปลง พื้นที่รวม และข้อมูลเชิงสถิติของโครงการปลูกป่าอเนกประสงค์",
    href: "/dashboard",
  },
  {
    icon: "⬇️",
    title: "ดาวน์โหลดข้อมูล GeoJSON",
    description:
      "ดาวน์โหลดข้อมูลตำแหน่งและขอบเขตแปลงในรูปแบบ GeoJSON เพื่อนำไปใช้กับซอฟต์แวร์ GIS",
    href: "/api/plots",
    external: true,
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-8 px-6 py-20 text-center bg-gradient-to-b from-green-50 to-white">
        <h1 className="max-w-2xl text-4xl font-bold leading-relaxed tracking-tight text-gray-900">
          ระบบฐานข้อมูลโครงการปลูกป่าอเนกประสงค์
          <br />
          <span className="text-green-700">พื้นที่คทช. แม่แจ่ม</span>
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-gray-500">
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
              className="rounded-full bg-green-700 px-8 py-3 text-base font-semibold text-white hover:bg-green-800 transition-colors shadow-sm"
            >
              ไปยัง Dashboard →
            </Link>
          }
        >
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="rounded-full bg-green-700 px-8 py-3 text-base font-semibold text-white hover:bg-green-800 transition-colors shadow-sm">
              เข้าสู่ระบบ
            </button>
          </SignInButton>
        </Show>
      </section>

      {/* Feature cards */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-semibold text-gray-800">
            ฟังก์ชันหลักของระบบ
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Show
                key={f.title}
                when="signed-in"
                fallback={
                  <SignInButton mode="modal" forceRedirectUrl={f.external ? "/dashboard" : f.href}>
                    <button className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer w-full">
                      <span className="text-3xl">{f.icon}</span>
                      <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                        {f.title}
                      </span>
                      <span className="text-sm leading-relaxed text-gray-500">
                        {f.description}
                      </span>
                    </button>
                  </SignInButton>
                }
              >
                <Link
                  href={f.href}
                  target={f.external ? "_blank" : undefined}
                  rel={f.external ? "noopener noreferrer" : undefined}
                  className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all"
                >
                  <span className="text-3xl">{f.icon}</span>
                  <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                    {f.title}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-500">
                    {f.description}
                  </span>
                </Link>
              </Show>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="px-6 py-12 bg-green-50 border-t border-green-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            เกี่ยวกับโครงการ
          </h2>
          <p className="text-gray-500 leading-relaxed">
            โครงการปลูกป่าอเนกประสงค์บนพื้นที่คทช. อำเภอแม่แจ่ม จังหวัดเชียงใหม่
            ดำเนินการโดยส่วนวนวัฒนวิจัย สำนักวิจัยและพัฒนาการป่าไม้ กรมป่าไม้
            มุ่งเน้นการฟื้นฟูระบบนิเวศป่าไม้และพัฒนาคุณภาพชีวิตของชุมชน
            โดยใช้ระบบสารสนเทศภูมิศาสตร์ในการบริหารจัดการข้อมูลแปลงปลูกป่า
          </p>
        </div>
      </section>
    </main>
  );
}
