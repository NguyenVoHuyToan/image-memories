'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Image as ImageIcon, Sparkles, Palette, Check, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UploadButton from '@/components/UploadButton';
import ImageCard from '@/components/ImageCard';
import { fetchImagesAction } from '@/lib/actions/imageActions';
import { updateDashboardBackgroundAction } from '@/lib/actions/userActions';
import { toast } from 'sonner';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Masonry from 'react-masonry-css';
import debounce from 'lodash.debounce';
import { useUser } from '@/context/UserContext';

interface ImageType {
  _id: string;
  url: string;
  title: string;
  tags?: string[];
}

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
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showBgPicker, setShowBgPicker] = useState(false);

  const { ref, inView } = useInView();

  const currentBackground = user?.dashboardBackground || 'default';

  useEffect(() => {
    const handler = debounce((val: string) => setDebouncedQuery(val), 500);
    handler(searchQuery);
    return () => handler.cancel();
  }, [searchQuery]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: queryStatus,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['images', session?.user?.email, debouncedQuery],
    queryFn: ({ pageParam = 1 }) => fetchImagesAction(pageParam, 12, debouncedQuery),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      return lastPage.success && lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const handleDeleteSuccess = (id: string) => {
    queryClient.setQueriesData({ queryKey: ['images', session?.user?.email] }, (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data ? page.data.filter((img: ImageType) => img._id !== id) : []
        }))
      };
    });
  };

  const changeBackground = async (bgId: string) => {
    setUser({ ...user, dashboardBackground: bgId });
    try {
      await updateDashboardBackgroundAction(bgId);
    } catch (err) {
      toast.error('Failed to save preference');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const allImages = data?.pages.flatMap((page: any) => page.data || []) || [];
  const activeBg = BACKGROUNDS.find(b => b.id === currentBackground) || BACKGROUNDS[0];

  return (
    <div className={`min-h-screen transition-all duration-700 ${activeBg.class} -mt-32 pt-32 px-6 pb-20`}>
      <div className="mx-auto max-w-7xl">
        {/* Simplified Header */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pt-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Gallery
              <div className={`h-2.5 w-2.5 rounded-full ${activeBg.dot} shadow-xl shadow-indigo-500/20`} />
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
              {allImages.length} Saved Memories
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-bold"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
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
                        onClick={() => {
                          changeBackground(bg.id);
                          setShowBgPicker(false);
                        }}
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

            <UploadButton onSuccess={refetch} />
          </div>
        </div>

        {/* Content Section */}
        {queryStatus === 'pending' ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : allImages.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Masonry
              breakpointCols={{ default: 5, 1200: 4, 900: 3, 700: 2, 500: 2 }}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {allImages.map((image: ImageType) => (
                <ImageCard
                  key={image._id}
                  image={image}
                  onDelete={handleDeleteSuccess}
                  onView={setSelectedImage}
                />
              ))}
            </Masonry>
            <div ref={ref} className="h-40 flex items-center justify-center mt-10">
              {isFetchingNextPage && <Loader2 className="animate-spin text-indigo-600" size={24} />}
            </div>
          </motion.div>
        ) : (
          <div className="flex h-[50vh] flex-col items-center justify-center rounded-[3rem] border border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-sm p-12 text-center">
            <ImageIcon className="text-slate-300 mb-6" size={64} />
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Your gallery is empty</h3>
            <p className="mt-2 text-slate-500 font-bold text-sm">Start by uploading your first memory today.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-500 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              className="max-h-[90vh] max-w-[95vw] rounded-4xl object-contain shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
