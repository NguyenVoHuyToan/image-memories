"use client";

import { useState, memo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Edit3, Check, X, ImageIcon,
  Maximize2, Download, Share2,
} from "lucide-react";
import { updateAlbumNameAction, deleteAlbumAction } from "@/lib/actions/albumActions";
import { deleteImageFromAlbumAction } from "@/lib/actions/imageActions";
import UploadButton from "@/components/UploadButton";
import { toast } from "sonner";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getOptimizedUrl(url: string, width = 800) {
  if (!url || !url.includes("cloudinary.com")) return url;
  // Insert Cloudinary optimizations: auto quality, auto format, and specific width
  return url.replace("/upload/", `/upload/q_auto,f_auto,w_${width}/`);
}

async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "memory.jpg";
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab for manual save
    window.open(url, "_blank");
  }
}

async function shareImage(url: string, title: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title: title || "My Memory", url });
    } catch {
      // User cancelled share — no action needed
    }
  } else {
    // Fallback for desktop: copy link
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
function AlbumCard({ album, onUpdate }: AlbumCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(album.name);
  const [debouncedName, setDebouncedName] = useState(album.name);
  const [localImages, setLocalImages] = useState(album.images);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Sync local images when server data refreshes
  useEffect(() => { setLocalImages(album.images); }, [album.images]);

  // Debounce album name input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedName(name), 300);
    return () => clearTimeout(handler);
  }, [name]);

  // Lock body scroll when Lightbox is open (prevent mobile ghost-scrolling)
  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedImage]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateName = useCallback(async () => {
    if (!debouncedName.trim() || debouncedName === album.name) {
      setIsEditing(false);
      return;
    }
    const res = await updateAlbumNameAction(album._id, debouncedName);
    if (res.success) { toast.success("Album renamed"); setIsEditing(false); onUpdate(); }
    else toast.error(res.error || "Failed to rename");
  }, [debouncedName, album._id, album.name, onUpdate]);

  const handleDeleteAlbum = useCallback(async () => {
    if (!confirm("Delete this entire album and all its images?")) return;
    const res = await deleteAlbumAction(album._id);
    if (res.success) { toast.success("Album deleted"); onUpdate(); }
    else toast.error(res.error || "Failed to delete album");
  }, [album._id, onUpdate]);

  const handleDeleteImage = useCallback(async (publicId: string) => {
    if (!confirm("Delete this image?")) return;
    const prev = localImages;
    setLocalImages(imgs => imgs.filter(i => i.publicId !== publicId));
    const res = await deleteImageFromAlbumAction(album._id, publicId);
    if (res.success) { toast.success("Image deleted"); onUpdate(); }
    else { setLocalImages(prev); toast.error(res.error || "Failed to delete"); }
  }, [album._id, onUpdate, localImages]);

  const handleDownload = useCallback((e: React.MouseEvent, img: ImageData) => {
    e.stopPropagation();
    const filename = img.title ? `${img.title}.jpg` : `${img.publicId}.jpg`;
    downloadImage(img.url, filename);
    toast.success("Đang tải ảnh về thiết bị…");
  }, []);

  const handleShare = useCallback((e: React.MouseEvent, img: ImageData) => {
    e.stopPropagation();
    shareImage(img.url, img.title);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────
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
        {/* ── Header ── */}
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
              <div className="flex items-center gap-2 cursor-pointer group/title" onClick={() => setIsEditing(true)}>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-none uppercase truncate">
                  {album.name}
                </h2>
                <Edit3 size={16} className="text-indigo-400 opacity-0 group-hover/title:opacity-100 transition-all" aria-hidden="true" />
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

        {/* ── Image Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {localImages.length > 0 ? (
            localImages.map((img, idx) => (
              <motion.div
                key={img.publicId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className="group/img relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
              >
                {/* ── Image (fills container) ── */}
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={getOptimizedUrl(img.url, 600)}
                    alt={img.title || `Memory in ${album.name}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                </div>

                {/* ── Gradient overlay on hover ── */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* ── Delete: top-right, always visible on mobile ── */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.publicId); }}
                  aria-label="Delete image"
                  className="absolute top-2 right-2 z-30 p-2 rounded-xl
                    bg-black/40 backdrop-blur-md text-white border border-white/10
                    transition-all active:scale-90 hover:bg-rose-500
                    opacity-60 sm:opacity-0 sm:group-hover/img:opacity-100"
                >
                  <Trash2 size={14} />
                </button>

                {/* ── Download + Share: slide up on desktop, always visible on mobile ── */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-1 p-2
                    sm:translate-y-full sm:group-hover/img:translate-y-0
                    max-sm:translate-y-0
                    transition-transform duration-300 ease-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleDownload(e, img)}
                    aria-label="Download"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl
                      bg-black/40 sm:bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase
                      hover:bg-indigo-500 active:scale-95 transition-all border border-white/10"
                  >
                    <Download size={12} />
                    <span className="max-xs:hidden">Save</span>
                  </button>
                  <button
                    onClick={(e) => handleShare(e, img)}
                    aria-label="Share"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl
                      bg-black/40 sm:bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase
                      hover:bg-violet-500 active:scale-95 transition-all border border-white/10"
                  >
                    <Share2 size={12} />
                    <span className="max-xs:hidden">Share</span>
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-300">
              <ImageIcon size={48} strokeWidth={1} className="mb-4 text-slate-200" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Album is empty</p>
            </div>
          )}
        </div>
      </motion.article>

      {/* ── Lightbox: Click-Anywhere-to-Close ── */}
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-300 flex flex-col items-center justify-center h-dvh w-full cursor-zoom-out"
            role="dialog"
            aria-modal="true"
            aria-label="Full screen image preview"
            onClick={() => setSelectedImage(null)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/96 backdrop-blur-3xl"
            />

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full flex-1 max-w-7xl z-10 flex items-center justify-center px-2"
            >
              <Image
                src={getOptimizedUrl(selectedImage.url, 1920)}
                alt={selectedImage.title || "Full preview"}
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-2xl cursor-default!"
              />

              {/* Close hint */}
              <div
                className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3 py-1.5 bg-white/5 backdrop-blur-md text-white/30 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest pointer-events-none"
              >
                Tap anywhere to close
              </div>
            </motion.div>

            {/* Action Bar at Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="relative z-10 flex items-center gap-3 pb-8 sm:pb-10 cursor-default"
            >
              {/* Download */}
              <button
                onClick={(e) => handleDownload(e, selectedImage)}
                aria-label="Download image"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-indigo-600 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10 shadow-xl"
              >
                <Download size={18} />
                Tải về
              </button>
              {/* Share */}
              <button
                onClick={(e) => handleShare(e, selectedImage)}
                aria-label="Share image"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-violet-600 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10 shadow-xl"
              >
                <Share2 size={18} />
                Chia sẻ
              </button>
              {/* Close */}
              <button
                onClick={() => setSelectedImage(null)}
                aria-label="Close preview"
                className="p-3 rounded-2xl bg-white/10 hover:bg-rose-500/80 backdrop-blur-md text-white/70 hover:text-white transition-all active:scale-95 border border-white/10 shadow-xl"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(AlbumCard);
