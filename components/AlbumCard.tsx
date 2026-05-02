"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Check, X, ImageIcon, Plus } from "lucide-react";
import { updateAlbumNameAction, deleteAlbumAction } from "@/lib/actions/albumActions";
import { deleteImageFromAlbumAction } from "@/lib/actions/imageActions";
import UploadButton from "@/components/UploadButton";
import { toast } from "sonner";

interface Image {
  url: string;
  publicId: string;
  title: string;
}

interface Album {
  _id: string;
  name: string;
  images: Image[];
}

interface AlbumCardProps {
  album: Album;
  onUpdate: () => void;
}

export default function AlbumCard({ album, onUpdate }: AlbumCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(album.name);

  const handleUpdateName = async () => {
    if (!name.trim() || name === album.name) {
      setIsEditing(false);
      return;
    }

    const res = await updateAlbumNameAction(album._id, name);
    if (res.success) {
      toast.success("Album name updated");
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update name");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!confirm("Are you sure you want to delete this album and all its images?")) return;
    
    const res = await deleteAlbumAction(album._id);
    if (res.success) {
      toast.success("Album deleted");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to delete album");
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!confirm("Delete this image?")) return;
    
    const res = await deleteImageFromAlbumAction(album._id, publicId);
    if (res.success) {
      toast.success("Image deleted");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to delete image");
    }
  };

  return (
    <motion.div
      id={`album-${album._id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col gap-4 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-5 sm:p-8 border border-white/50 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 scroll-mt-32"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                className="flex-1 min-w-0 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border-2 border-indigo-500 outline-none font-bold text-slate-900 dark:text-white shadow-inner"
              />
              <div className="flex gap-1 shrink-0">
                <button onClick={handleUpdateName} className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Check size={20} />
                </button>
                <button onClick={() => { setName(album.name); setIsEditing(false); }} className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer group/title" onClick={() => setIsEditing(true)}>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-none uppercase truncate">
                {album.name}
              </h3>
              <Edit3 size={16} className="text-indigo-400 opacity-0 group-hover/title:opacity-100 transition-all transform hover:scale-110" />
            </div>
          )}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
            {album.images.length} Memorable Moments
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <UploadButton albumId={album._id} onSuccess={onUpdate} />
          <button 
            onClick={handleDeleteAlbum}
            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Internal Scrollable Grid */}
      <div className="relative">
        <div className="max-h-[480px] overflow-y-auto pr-2 no-scrollbar custom-scrollbar transition-all duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-6">
            {album.images.length > 0 ? (
              album.images.map((img) => (
                <motion.div
                  key={img.publicId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group/img relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => handleDeleteImage(img.publicId)}
                      className="p-3 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-rose-500 transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                <ImageIcon size={48} strokeWidth={1} className="mb-4 text-slate-200" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Album is empty</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Shadow Fade Effect - Chỉ hiện khi có nhiều ảnh */}
        {album.images.length > 10 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent pointer-events-none rounded-b-[2rem]" />
        )}
      </div>
    </motion.div>
  );
}
