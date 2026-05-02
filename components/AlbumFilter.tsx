"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MapPin } from "lucide-react";

interface AlbumFilterProps {
  albums: any[];
  onAlbumClick: (albumId: string) => void;
  onAddAlbum: () => void;
}

export default function AlbumFilter({
  albums,
  onAlbumClick,
  onAddAlbum,
}: AlbumFilterProps) {
  const renderedFilters = useMemo(() => {
    return albums.map((album) => (
      <button
        key={album._id}
        onClick={() => onAlbumClick(album._id)}
        className="shrink-0 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95 shadow-sm"
      >
        {album.name}
      </button>
    ));
  }, [albums, onAlbumClick]);

  return (
    <div className="sticky top-24 sm:top-32 z-40 mb-6 sm:mb-10 w-full px-1">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 sm:gap-4 bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl p-1.5 sm:p-2.5 rounded-2xl sm:rounded-[2.5rem] border border-white/40 dark:border-slate-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        {/* Mobile Icon vs Desktop Text */}
        <div className="flex items-center gap-2 px-2 sm:px-4 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-2 rounded-xl sm:rounded-3xl shrink-0">
          <MapPin size={14} className="text-indigo-500" />
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Go To Album
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1 pr-2 items-center">
          {renderedFilters}

          <button
            onClick={onAddAlbum}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            title="Create New Album"
          >
            <Plus size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
