'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ProfileModal from './ProfileModal';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardNav() {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <nav className="fixed top-6 left-6 right-6 z-100 mx-auto max-w-7xl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-2xl p-2 pl-6 rounded-[2.5rem] border border-white/40 dark:bg-slate-900/80 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between"
        >
          {/* Logo Section */}
          <Link href="/" className="group outline-none">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-[1.25rem] bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <Camera className="text-white" size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                  Memories
                </h1>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mt-1.5 opacity-80">
                  Private Cloud
                </p>
              </div>
            </div>
          </Link>

          {/* User Controls */}
          <div className="flex items-center gap-3 pr-2">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all dark:bg-slate-800 dark:border-slate-700 group focus:ring-2 focus:ring-indigo-500/10"
              >
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={20} />
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
                    {user?.username || user?.name || "Guest"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                    Member
                  </p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
                    >
                      <button
                        onClick={() => { setIsProfileOpen(true); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-left"
                      >
                        <Settings size={18} />
                        Account Settings
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all text-left"
                      >
                        <LogOut size={18} />
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </nav>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
      />
    </>
  );
}
