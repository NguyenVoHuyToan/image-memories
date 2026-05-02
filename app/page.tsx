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
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Semantic Navigation */}
      <header className="fixed top-0 w-full z-150 py-4 sm:py-6">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl sm:rounded-[2.5rem] px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center shadow-2xl shadow-indigo-500/5">
            <Link
              href="/"
              className="group shrink-0"
              aria-label="Memories Home"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Camera className="text-white h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="text-lg sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                  Memories
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
              {session ? (
                <Link
                  href="/dashboard"
                  className="text-xs sm:text-sm font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all py-2 sm:py-3 px-4 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-1 sm:gap-2"
                >
                  Dashboard{" "}
                  <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[10px] sm:text-sm font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors uppercase tracking-widest sm:tracking-normal sm:capitalize"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="text-[10px] sm:text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all py-2.5 sm:py-3 px-4 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-500/20 whitespace-nowrap uppercase tracking-widest"
                  >
                    Đăng Ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 z-10">
        <section className="max-w-7xl mx-auto w-full text-center">
          <div className="flex flex-col items-center max-w-4xl mx-auto mb-20 px-4">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 px-6 py-2 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-black mb-10 tracking-widest uppercase">
              <Sparkles size={16} aria-hidden="true" />
              <span>Personalized Memory Cloud</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black tracking-tight mb-10 leading-[1.1] text-slate-900 dark:text-white">
              Nơi lưu trữ từng <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                khoảnh khắc
              </span>{" "}
              <br />
              của riêng bạn.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-500 dark:text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-bold tracking-tight">
              An toàn. Tinh tế. Và hoàn toàn miễn phí. Trải nghiệm kỉ nguyên mới
              của việc lưu trữ hình ảnh trực tuyến.
            </p>

            {/* CTA removed from center per user request */}
          </div>

          {/* Feature Grid Section */}
          <section
            className="grid md:grid-cols-3 gap-8 mt-20"
            aria-label="Tính năng chính"
          >
            {[
              {
                icon: Shield,
                title: "Bảo mật tuyệt đối",
                desc: "Dữ liệu được mã hóa đa lớp, đảm bảo chỉ có bạn mới có quyền tiếp cận kỉ niệm của mình.",
                color: "bg-emerald-500",
              },
              {
                icon: Zap,
                title: "Tốc độ ánh sáng",
                desc: "Sử dụng công nghệ CDN hiện đại nhất, tải hàng trăm tấm ảnh trong tích tắc.",
                color: "bg-amber-500",
              },
              {
                icon: Sparkles,
                title: "Trải nghiệm UI/UX",
                desc: "Thiết kế hiện đại, tập trung vào cảm xúc, giúp bạn đắm chìm trong từng kỉ niệm.",
                color: "bg-indigo-500",
              },
            ].map((feature, idx) => (
              <article
                key={idx}
                className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group text-left"
              >
                <div
                  className={`${feature.color} h-16 w-16 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:rotate-12 transition-transform`}
                >
                  <feature.icon size={28} aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                  {feature.desc}
                </p>
              </article>
            ))}
          </section>
        </section>
      </main>

      {/* Semantic Footer */}
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
            <Link href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-indigo-600 transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/NguyenVoHuyToan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Github Profile"
              className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
        <div className="text-center mt-12 text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">
          © 2026 Designed & Engineerd for High Performance.
        </div>
      </footer>
    </div>
  );
}
