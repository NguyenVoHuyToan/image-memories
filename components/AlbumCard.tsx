"use client";

import { useState, memo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Check, X, ImageIcon, Plus, ZoomIn, Maximize2 } from "lucide-react";
import { updateAlbumNameAction, deleteAlbumAction } from "@/lib/actions/albumActions";
import { deleteImageFromAlbumAction } from "@/lib/actions/imageActions";
import UploadButton from "@/components/UploadButton";
import { toast } from "sonner";
import Image from "next/image";

interface ImageData {
  url: string;
  publicId: string;
  title: string;
}

interface Album {
  _id: string;
  name: string;
  images: ImageData[];
}

interface AlbumCardProps {
  album: Album;
  onUpdate: () => void;
}

function AlbumCard({ album, onUpdate }: AlbumCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(album.name);
  const [debouncedName, setDebouncedName] = useState(album.name);
  const [localImages, setLocalImages] = useState(album.images);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalImages(album.images);
  }, [album.images]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name);
    }, 300);
    return () => clearTimeout(handler);
  }, [name]);

  const handleUpdateName = useCallback(async () => {
    if (!debouncedName.trim() || debouncedName === album.name) {
      setIsEditing(false);
      return;
    }

    const res = await updateAlbumNameAction(album._id, debouncedName);
    if (res.success) {
      toast.success("Album name updated");
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update name");
    }
  }, [debouncedName, album._id, album.name, onUpdate]);

  const handleDeleteAlbum = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this album and all its images?")) return;
    
    const res = await deleteAlbumAction(album._id);
    if (res.success) {
      toast.success("Album deleted");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to delete album");
    }
  }, [album._id, onUpdate]);

  const handleDeleteImage = useCallback(async (publicId: string) => {
    if (!confirm("Delete this image?")) return;
    
    const previousImages = localImages;
    setLocalImages(prev => prev.filter(img => img.publicId !== publicId));
    
    const res = await deleteImageFromAlbumAction(album._id, publicId);
    
    if (res.success) {
      toast.success("Image deleted");
      onUpdate(); 
    } else {
      setLocalImages(previousImages);
      toast.error(res.error || "Failed to delete image");
    }
  }, [album._id, onUpdate, localImages]);

  // Lock body scroll when Lightbox is open to prevent mobile "ghost scrolling"
  useEffect(() => {
    if (selectedImageUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImageUrl]);

  return (
    <>
      <motion.article
        id={`album-${album._id}`}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative flex flex-col gap-4 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl p-5 sm:p-8 border border-white/50 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 scroll-mt-48"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  autoFocus
                  type="text"
                  value={name}
                  aria-label="Edit Album Name"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                  className="flex-1 min-w-0 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border-2 border-indigo-500 outline-none font-bold text-slate-900 dark:text-white shadow-inner"
                />
                <div className="flex gap-1 shrink-0">
                  <button onClick={handleUpdateName} aria-label="Confirm Rename" className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <Check size={20} />
                  </button>
                  <button onClick={() => { setName(album.name); setIsEditing(false); }} aria-label="Cancel Rename" className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 cursor-pointer group/title" onClick={() => setIsEditing(true)} title="Click to rename album">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-none uppercase truncate">
                  {album.name}
                </h2>
                <Edit3 size={16} className="text-indigo-400 opacity-0 group-hover/title:opacity-100 transition-all transform hover:scale-110" aria-hidden="true" />
              </div>
            )}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
              {localImages.length} Memories
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <UploadButton albumId={album._id} onSuccess={onUpdate} />
            <button 
              onClick={handleDeleteAlbum}
              aria-label={`Delete Album ${album.name}`}
              className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Image Grid */}
        <div className="relative overflow-hidden">
          <div 
            className="max-h-[480px] overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 transform-gpu"
            style={{ willChange: "scroll-position", contain: "content" }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-6">
              {localImages.length > 0 ? (
                localImages.map((img, idx) => (
                  <motion.div
                    key={img.publicId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group/img relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  >
                    {/* Delete Toggle Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.publicId);
                      }}
                      aria-label="Delete this image"
                      className="absolute top-2 right-2 z-20 p-2 sm:p-2.5 bg-black/40 backdrop-blur-xl text-white rounded-xl sm:opacity-0 sm:group-hover/img:opacity-100 transition-all active:scale-90 hover:bg-rose-500 shadow-lg border border-white/10 flex items-center justify-center max-sm:opacity-80" 
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Image Surface with Zoom Accessibility */}
                    <button 
                      onClick={() => setSelectedImageUrl(img.url)}
                      aria-label={`View full size: ${img.title || 'Image'}`}
                      className="relative h-full w-full cursor-zoom-in block outline-none focus:ring-4 focus:ring-indigo-500/30"
                    >
                      <Image
                        src={img.url}
                        alt={img.title || `Memory in ${album.name}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center p-4">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-2xl scale-75 group-hover/img:scale-100 transition-transform">
                          <Maximize2 className="text-white drop-shadow-md" size={24} aria-hidden="true" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                  <ImageIcon size={48} strokeWidth={1} className="mb-4 text-slate-200" aria-hidden="true" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Album is empty</p>
                </div>
              )}
            </div>
          </div>
          
          {localImages.length > 10 && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 dark:from-slate-900/90 to-transparent pointer-events-none rounded-b-[2rem] z-20" aria-hidden="true" />
          )}
        </div>
      </motion.article>

      {/* Lightbox Preview Modal - Improved with Click-Anywhere-to-Close */}
      <AnimatePresence>
        {selectedImageUrl && (
          <div 
            className="fixed inset-0 z-300 flex items-center justify-center p-2 sm:p-4 h-dvh w-full cursor-zoom-out"
            role="dialog"
            aria-modal="true"
            aria-label="Full screen image preview"
            onClick={() => setSelectedImageUrl(null)} // Close when clicking anywhere
          >
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
            />
            
            {/* Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full h-full max-w-7xl max-h-[94dvh] z-10 flex items-center justify-center"
            >
              <Image
                src={selectedImageUrl}
                alt="Full sized preview"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
              
              {/* Subtle Close Indicator */}
              <div className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md text-white/50 rounded-full border border-white/10 pointer-events-none">
                <X size={24} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(AlbumCard);
