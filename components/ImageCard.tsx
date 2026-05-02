'use client';

import Image from 'next/image';
import { Trash2, Maximize2, Edit3, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { deleteImageAction, updateImageAction } from '@/lib/actions/imageActions';
import { toast } from 'sonner';
import { getOptimizedImageUrl, getBlurDataUrl } from '@/lib/imageUtils';
import { useQueryClient } from '@tanstack/react-query';

interface ImageCardProps {
  image: {
    _id: string;
    url: string;
    title: string;
  };
  onDelete: (id: string) => void;
  onView: (url: string) => void;
}

export default function ImageCard({ image, onDelete, onView }: ImageCardProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(image.title);
  const [currentTitle, setCurrentTitle] = useState(image.title);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) {
      // Optimistic UI: Xóa khỏi giao diện ngay lập tức
      onDelete(image._id);
      setIsDeleting(true);

      try {
        const res = await deleteImageAction(image._id);
        if (res.success) {
          toast.success('Xóa thành công');
        } else {
          toast.error(res.error || 'Lỗi khi xóa');
          // Rollback nếu lỗi bằng cách làm mới dữ liệu
          queryClient.invalidateQueries({ queryKey: ['images'] });
        }
      } catch (err) {
        toast.error('Lỗi hệ thống khi xóa');
        queryClient.invalidateQueries({ queryKey: ['images'] });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (newTitle === currentTitle) {
      setIsEditing(false);
      return;
    }
    const res = await updateImageAction(image._id, { title: newTitle });
    if (res.success) {
      toast.success('Title updated');
      setCurrentTitle(newTitle);
      setIsEditing(false);
    } else {
      toast.error(res.error || 'Update failed');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative mb-4 overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-all hover:shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
    >
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={getOptimizedImageUrl(image.url, 600)}
            alt={currentTitle}
            width={600}
            height={800}
            placeholder="blur"
            blurDataURL={getBlurDataUrl(image.url)}
            onLoad={() => setIsLoaded(true)}
            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </motion.div>
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse" />
        )}
      </div>
      
      {/* Overlay Actions */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md hover:bg-white/40 transition-all shadow-lg"
          >
            <Edit3 size={18} />
          </button>
        </div>

        <div className="flex items-end justify-between gap-4">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex flex-1 gap-1 items-center bg-white rounded-xl p-1 shadow-2xl"
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-sm font-bold text-slate-900 outline-none"
                  autoFocus
                />
                <button onClick={handleUpdate} className="p-1 text-slate-400 hover:text-green-600 transition-colors"><Check size={18} /></button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><X size={18} /></button>
              </motion.div>
            ) : (
              <motion.p className="flex-1 truncate text-sm font-black text-white drop-shadow-lg leading-tight uppercase tracking-tight">
                {currentTitle}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onView(image.url)}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg hover:scale-110 active:scale-95 transition-all shadow-indigo-500/40"
            >
              <Maximize2 size={20} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
