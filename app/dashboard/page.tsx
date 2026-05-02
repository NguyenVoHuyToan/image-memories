"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FolderPlus, Palette, Check, LayoutGrid, List, ArrowUp, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchAlbumsAction, createAlbumAction } from "@/lib/actions/albumActions";
import AlbumCard from "@/components/AlbumCard";
import AlbumFilter from "@/components/AlbumFilter";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

const BACKGROUNDS = [
  { id: "default", name: "Clean", class: "bg-slate-50 dark:bg-slate-950", dot: "bg-slate-300" },
  { id: "indigo", name: "Midnight", class: "bg-[#fafaff] dark:bg-[#020617]", dot: "bg-indigo-500" },
  { id: "rose", name: "Rose", class: "bg-[#fffafa] dark:bg-[#020617]", dot: "bg-rose-500" },
  { id: "emerald", name: "Emerald", class: "bg-[#fafffa] dark:bg-[#020617]", dot: "bg-emerald-500" },
  { id: "amber", name: "Amber", class: "bg-[#fffdfa] dark:bg-[#020617]", dot: "bg-amber-500" }
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { user, setUser } = useUser();
  const router = useRouter();
  
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const currentBackground = user?.dashboardBackground || "default";

  const loadAlbums = async () => {
    setIsLoading(true);
    const res = await fetchAlbumsAction();
    if (res.success) {
      setAlbums(res.data);
    } else {
      toast.error("Failed to load albums");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
    if (status === "authenticated") loadAlbums();
  }, [status, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddNewAlbum = async () => {
    const res = await createAlbumAction("Phim & Kỷ niệm");
    if (res.success) {
      setAlbums([res.data, ...albums]);
      toast.success("New Album added");
    } else {
      toast.error(res.error || "Failed to create album");
    }
  };

  const scrollToAlbum = useCallback((albumId: string) => {
    const element = document.getElementById(`album-${albumId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const changeBackground = (bgId: string) => {
    setUser({ ...user, dashboardBackground: bgId });
    setShowBgPicker(false);
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const activeBg = BACKGROUNDS.find(b => b.id === currentBackground) || BACKGROUNDS[0];

  return (
    <div className={`min-h-screen transition-all duration-700 ${activeBg.class} -mt-32 pt-36 sm:pt-48 px-4 sm:px-6 pb-20 scroll-smooth`}>
      <div className="mx-auto max-w-7xl">
        
        <AlbumFilter 
          albums={albums} 
          onAlbumClick={scrollToAlbum} 
          onAddAlbum={handleAddNewAlbum}
        />

        {/* Condensed Header Section */}
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between lg:block">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 sm:gap-4">
                My Albums
                <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${activeBg.dot} shadow-xl shadow-indigo-500/50`} />
              </h2>
              <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1 sm:mt-2">
                {albums.length} Private Collections
              </p>
            </div>
            
            {/* FAB replacement for mobile in header */}
            <button
               onClick={handleAddNewAlbum}
               className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg active:scale-90 transition-transform"
            >
              <Plus size={20} />
            </button>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <LayoutGrid size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <List size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Background Picker */}
            <div className="relative">
              <button
                onClick={() => setShowBgPicker(!showBgPicker)}
                className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-white/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Palette size={18} className="sm:w-5 sm:h-5" />
              </button>
              
              <AnimatePresence>
                {showBgPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 min-w-[140px]"
                  >
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => changeBackground(bg.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-[10px] font-black rounded-xl transition-all ${currentBackground === bg.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                      >
                        {bg.name}
                        {currentBackground === bg.id && <Check size={12} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hidden on mobile, use FAB or Plus icon above */}
            <button
              onClick={handleAddNewAlbum}
              className="hidden lg:flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 text-sm font-black shadow-xl shadow-indigo-500/10 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
            >
              <FolderPlus size={20} />
              <span>New Album</span>
            </button>
          </div>
        </div>

        {/* Albums List/Grid */}
        <div className={`grid gap-6 sm:gap-12 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
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
                className="col-span-full flex flex-col items-center justify-center py-24 sm:py-40 bg-white/20 dark:bg-slate-900/20 rounded-[2.5rem] sm:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 sm:p-8 rounded-full mb-4 sm:mb-6">
                  <FolderPlus size={48} className="text-indigo-400 sm:w-16 sm:h-16" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">No Albums Found</h3>
                <p className="text-slate-400 font-bold mt-2 text-xs sm:text-sm text-center px-4">Create your first album to organize your memories.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-6 right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-100"
            >
              <ArrowUp size={20} className="sm:w-6 sm:h-6" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
