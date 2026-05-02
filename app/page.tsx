import Link from "next/link";
import Image from "next/image";
import { Camera, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
                <Camera className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Memories
              </span>
            </div>
          </Link>
          <div className="flex gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="text-sm font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-all py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors py-2.5 px-5 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all py-2.5 px-6 rounded-xl shadow-lg hover:shadow-slate-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 bg-[url('/images/hero.png')] bg-fixed bg-cover bg-center">
        {/* Glass Overlay */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm -z-10" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-indigo-50 via-white/50 to-white" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-100/50 border border-indigo-200/50 px-4 py-1.5 rounded-full text-indigo-600 text-sm font-bold mb-8 animate-fade-in">
                <Sparkles size={16} />
                <span>Modern Photo Storage</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-slate-900">
                Keep your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">
                  best memories
                </span>{" "}
                <br />
                alive.
              </h1>
              <p className="text-xl text-slate-600 mb-12 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                A secure, ultra-fast, and beautiful space to preserve your
                personal story. Experience your photos like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link
                  href={session ? "/dashboard" : "/register"}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-xl font-black py-5 px-10 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-1 text-center"
                >
                  {session ? "Enter Dashboard" : "Start for Free"}
                </Link>
                {/* ... community part ... */}
              </div>
            </div>

            <div className="relative group lg:block hidden">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-[3rem] blur-[100px] transform rotate-6 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-12 border-white bg-slate-100 aspect-4/5 transform hover:rotate-1 transition-transform duration-700">
                <Image
                  src="/images/hero.png"
                  alt="Memories Dashboard Preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Camera size={18} />
            <span className="font-bold">Memories App</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2026 Crafted with ❤️ for your story.
          </p>
        </div>
      </footer>
    </div>
  );
}
