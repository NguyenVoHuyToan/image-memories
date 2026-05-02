'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FolderPlus, Palette, Check, LayoutGrid, List } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { fetchAlbumsAction, createAlbumAction } from '@/lib/actions/albumActions';
import AlbumCard from '@/components/AlbumCard';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

const BACKGROUNDS = [
  { id: 'default', name: 'Clean', class: 'bg-slate-50 dark:bg-slate-950', dot: 'bg-slate-300' },
  { id: 'indigo', name: 'Midnight', class: 'bg-[#fafaff] dark:bg-[#020617]', dot: 'bg-indigo-500' },
  { id: 'rose', name: 'Rose', class: 'bg-[#fffafa] dark:bg-[#020617]', dot: 'bg-rose-500' },
  { id: 'emerald', name: 'Emerald', class: 'bg-[#fafffa] dark:bg-[#020617]', dot: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', class: 'bg-[#fffdfa] dark:bg-[#020617]', dot: 'bg-amber-500' }
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { user, setUser } = useUser();
  const router = useRouter();
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const currentBackground = user?.dashboardBackground || 'default';

  const loadAlbums = async () => {
    setIsLoading(true);
    const res = await fetchAlbumsAction();
    if (res.success) {
      setAlbums(res.data);
    } else {
      toast.error('Failed to load albums');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (status === 'authenticated') loadAlbums();
  }, [status, router]);

  const handleAddNewAlbum = async () => {
    // Optimistically add a placeholder or just call the action
    const res = await createAlbumAction("Phim & Kỷ niệm");
    if (res.success) {
      setAlbums([res.data, ...albums]);
      toast.success('New Album added');
    } else {
      toast.error(res.error || 'Failed to create album');
    }
  };

  const changeBackground = (bgId: string) => {
    setUser({ ...user, dashboardBackground: bgId });
    setShowBgPicker(false);
    // Ideally call back-end action here too if you want it persistent
  };

  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const activeBg = BACKGROUNDS.find(b => b.id === currentBackground) || BACKGROUNDS[0];

  return (
    <div className={`min-h-screen transition-all duration-700 ${activeBg.class} -mt-32 pt-32 px-6 pb-20`}>
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pt-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
              My Albums
              <div className={`h-3 w-3 rounded-full ${activeBg.dot} shadow-xl shadow-indigo-500/50`} />
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">
              Managing {albums.length} Private Collections
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Background Picker */}
            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Palette size={20} />
              </button>
              
              <AnimatePresence>
                {showBgPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 min-w-[160px]"
                  >
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => changeBackground(bg.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-black rounded-xl transition-all ${currentBackground === bg.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {bg.name}
                        {currentBackground === bg.id && <Check size={14} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add New Album Button */}
            <button
              onClick={handleAddNewAlbum}
              className="flex items-center gap-3 rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-xl shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
            >
              <FolderPlus size={20} />
              <span>Add New Album</span>
            </button>
          </div>
        </div>

        {/* Albums List/Grid */}
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          <AnimatePresence mode="popLayout">
            {albums.length > 0 ? (
              albums.map((album) => (
                <AlbumCard 
                  key={album._id} 
                  album={album} 
                  onUpdate={loadAlbums} 
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-40 bg-white/20 dark:bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-full mb-6">
                  <FolderPlus size={64} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">No Albums Found</h3>
                <p className="text-slate-400 font-bold mt-2">Create your first album to organize your memories.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
