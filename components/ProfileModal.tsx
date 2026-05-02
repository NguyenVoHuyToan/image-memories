'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, FileText, Check, Loader2, Camera } from 'lucide-react';
import { updateUserProfileAction, uploadAvatarAction } from '@/lib/actions/userActions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function ProfileModal({ isOpen, onClose, user: initialUser }: ProfileModalProps) {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadAvatarAction(formData);
      if (res.success) {
        setAvatar(res.url);
        // Instant update in context
        setUser({ ...user, avatar: res.url });
        toast.success('Avatar updated!');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to upload avatar');
      }
    } catch (err) {
      toast.error('Error uploading avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const res = await updateUserProfileAction({ username, bio });
      if (res.success) {
        setUser(res.data);
        toast.success('Profile updated successfully');
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-4xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h2>
              <button 
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={isUpdating || isUploadingAvatar}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden relative">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User size={56} className="text-slate-300" />
                    )}
                    
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <Loader2 size={24} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-1 right-1 h-9 w-9 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={16} />
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Bio</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[80px] pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                    placeholder="Short bio..."
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-600 hover:bg-slate-100 transition-all"
                  disabled={isUpdating || isUploadingAvatar}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isUploadingAvatar}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                >
                  {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
