"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, FileText, Check, Loader2, Camera, ShieldCheck } from "lucide-react";
import { updateUserProfileAction, uploadAvatarAction } from "@/lib/actions/userActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Image from "next/image";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

function ProfileModal({ isOpen, onClose, user: initialUser }: ProfileModalProps) {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadAvatarAction(formData);
      if (res.success) {
        setAvatar(res.url);
        setUser({ ...user, avatar: res.url });
        toast.success("Avatar updated!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to upload avatar");
      }
    } catch (err) {
      toast.error("Error uploading avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, setUser, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const res = await updateUserProfileAction({ username, bio });
      if (res.success) {
        setUser(res.data);
        toast.success("Profile updated successfully");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  }, [username, bio, setUser, router, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 shadow-3xl border border-white/50 dark:border-slate-800"
          >
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Settings</h2>
                <div className="mt-2 flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Safe & Secure Profile
                </div>
              </div>
              <button 
                onClick={onClose}
                className="rounded-2xl p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400"
                disabled={isUpdating || isUploadingAvatar}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex justify-center mb-10">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden relative transition-transform group-hover:scale-105 duration-500">
                    {avatar ? (
                      <Image 
                        src={avatar} 
                        alt="Avatar" 
                        fill 
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <User size={64} className="text-slate-300" />
                    )}
                    
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                        <Loader2 size={32} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 h-11 w-11 bg-indigo-600 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all">
                    <Camera size={18} />
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-full">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 dark:text-white"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-full">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">About Me</label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-5 top-5 text-slate-400" />
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full min-h-[120px] pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-slate-600 dark:text-slate-300"
                      placeholder="Share a bit about your story..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
                  disabled={isUpdating || isUploadingAvatar}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isUploadingAvatar}
                  className="flex-[2] flex items-center justify-center gap-3 py-5 rounded-3xl bg-linear-to-r from-indigo-600 to-violet-600 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save Profile Info
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default memo(ProfileModal);
