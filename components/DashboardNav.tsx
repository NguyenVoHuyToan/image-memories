'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ProfileModal from './ProfileModal';
import { useUser } from '@/context/UserContext';

export default function DashboardNav() {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-6 left-6 right-6 z-100 mx-auto max-w-7xl">
        <div className="bg-white/70 backdrop-blur-xl p-3 pl-6 rounded-4xl border border-white/50 dark:bg-slate-900/70 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Camera className="text-white" size={20} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Memories
                </h1>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">
                  Private Cloud
                </p>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all dark:bg-slate-800 dark:border-slate-700 group"
            >
              <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                  {user?.username || user?.name || "Guest"}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                  Settings
                </p>
              </div>
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95 dark:bg-slate-800 dark:border-slate-700"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </>
  );
}
