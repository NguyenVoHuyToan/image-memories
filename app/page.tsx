import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-150 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-[2.5rem] px-8 h-20 flex justify-between items-center shadow-2xl shadow-indigo-500/5">
            <Link href="/" className="group">
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-2 rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Camera className="text-white" size={24} />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                  Memories
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all py-3 px-8 rounded-2xl shadow-xl flex items-center gap-2"
                >
                  Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all py-3 px-8 rounded-2xl shadow-xl shadow-indigo-500/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-6 py-2 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-black mb-10 tracking-widest uppercase">
              <Sparkles size={16} />
              <span>Personalized Memory Cloud</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black tracking-tight mb-10 leading-[1.1] text-slate-900 dark:text-white">
              Lưu giữ từng <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                khoảnh khắc
              </span>{" "}
              <br />
              mãi mãi.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-bold tracking-tight">
              Không gian an toàn, hiện đại và tinh tế để bạn bảo tồn những câu
              chuyện đời thường. Trải nghiệm album ảnh theo cách hoàn toàn mới.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Link
                href={session ? "/dashboard" : "/register"}
                className="group relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-20 px-12 rounded-[2rem] flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/10"
              >
                <span className="text-xl font-black uppercase tracking-widest">
                  {session ? "Vào Dashboard" : "Bắt đầu ngay"}
                </span>
                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white group-hover:translate-x-2 transition-transform">
                  <ArrowRight size={24} />
                </div>
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {[
              {
                icon: Shield,
                title: "An toàn tuyệt đối",
                desc: "Mã hóa dữ liệu và bảo mật đa lớp chuẩn quốc tế.",
                color: "bg-emerald-500",
              },
              {
                icon: Zap,
                title: "Tốc độ vượt trội",
                desc: "Tối ưu hóa ảnh tự động với Cloudinary, load nhanh tức thì.",
                color: "bg-amber-500",
              },
              {
                icon: Sparkles,
                title: "Thiết kế hiện đại",
                desc: "Giao diện tinh tế, tập trung hoàn toàn vào cảm xúc của bạn.",
                color: "bg-indigo-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div
                  className={`${feature.color} h-16 w-16 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-12 transition-transform`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Camera size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Memories App
            </span>
          </div>

          <div className="flex gap-10 text-sm font-black text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-indigo-600">
              Privacy
            </Link>
            <Link href="#" className="hover:text-indigo-600">
              Terms
            </Link>
            <Link href="#" className="hover:text-indigo-600">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
        <div className="text-center mt-12 text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
          © 2026 Crafted with Passion for Your Story.
        </div>
      </footer>
    </div>
  );
}
