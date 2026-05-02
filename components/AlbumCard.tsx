'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Check, X, Plus, ImageIcon } from 'lucide-react';
import { updateAlbumNameAction, deleteAlbumAction } from '@/lib/actions/albumActions';
import { deleteImageFromAlbumAction } from '@/lib/actions/imageActions';
import UploadButton from '@/components/UploadButton';
import { toast } from 'sonner';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async () => {
    if (!name.trim() || name === album.name) {
      setIsEditing(false);
      return;
    }

    const res = await updateAlbumNameAction(album._id, name);
    if (res.success) {
      toast.success('Album name updated');
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(res.error || 'Failed to update name');
    }
  };

  const handleDeleteAlbum = async () => {
    if (!confirm('Are you sure you want to delete this album and all its images?')) return;
    
    const res = await deleteAlbumAction(album._id);
    if (res.success) {
      toast.success('Album deleted');
      onUpdate();
    } else {
      toast.error(res.error || 'Failed to delete album');
    }
  };

  const handleDeleteImage = async (publicId: string) => {
    if (!confirm('Delete this image?')) return;
    
    const res = await deleteImageFromAlbumAction(album._id, publicId);
    if (res.success) {
      toast.success('Image deleted');
      onUpdate();
    } else {
      toast.error(res.error || 'Failed to delete image');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col gap-4 rounded-4xl bg-white/60 p-6 backdrop-blur-xl transition-all hover:bg-white/80 dark:bg-slate-900/60 dark:hover:bg-slate-900/80 border border-slate-100 dark:border-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                className="w-full bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 outline-none font-bold text-lg"
              />
              <button onClick={handleUpdateName} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                <Check size={20} />
              </button>
              <button onClick={() => { setName(album.name); setIsEditing(false); }} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase">
                {album.name}
              </h3>
              <Edit3 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {album.images.length} Items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <UploadButton albumId={album._id} onSuccess={onUpdate} />
          <button 
            onClick={handleDeleteAlbum}
            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[100px]">
        {album.images.length > 0 ? (
          album.images.map((img) => (
            <motion.div
              key={img.publicId}
              layout
              className="group/img relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
            >
              <img
                src={img.url}
                alt={img.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDeleteImage(img.publicId)}
                  className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-slate-300 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
            <ImageIcon size={32} strokeWidth={1.5} className="mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Empty Album</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
