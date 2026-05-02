"use client";

import { useState, useCallback } from "react";
import { Upload, Plus, X, FileImage, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImageAction } from "@/lib/actions/imageActions";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface UploadButtonProps {
  albumId: string;
  onSuccess: () => void;
}

const MAX_SIZE = 5 * 1024 * 1024;

export default function UploadButton({ albumId, onSuccess }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: MAX_SIZE,
    maxFiles: 10,
    multiple: true,
    onDropRejected: (fileRejections) => {
      const isTooMany = fileRejections.some(r => r.errors.some(e => e.code === "too-many-files"));
      if (isTooMany) toast.error("You can only upload up to 10 images at once");
      else toast.error("Some files are too large or invalid");
    }
  });

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} images...`);

    try {
      let successCount = 0;
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.split(".")[0]);
        formData.append("albumId", albumId);
        
        try {
          const result = await uploadImageAction(formData);
          if (result.success) {
            successCount++;
          } else {
            console.error(`Upload error for ${file.name}:`, result.error);
            toast.error(`Error with ${file.name}: ${result.error}`);
          }
        } catch (innerErr: any) {
          console.error(`System error for ${file.name}:`, innerErr);
          toast.error(`System error for ${file.name}`);
        }
      }

      if (successCount === files.length) {
        toast.success(`Tất cả ${successCount} ảnh đã được tải lên thành công!`, { id: toastId });
        setFiles([]);
        setIsOpen(false);
        onSuccess();
      } else if (successCount > 0) {
        toast.warning(`Đã tải lên ${successCount}/${files.length} ảnh. Kiểm tra lại các file lỗi.`, { id: toastId });
        setFiles(prev => prev.slice(successCount)); 
        onSuccess();
      } else {
        toast.error("Không có ảnh nào được tải lên. Hãy kiểm tra kết nối và cấu hình.", { id: toastId });
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi nghiêm trọng trong quá trình upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 px-3 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Plus size={20} />
        <span className="hidden sm:block">New Memory</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => !isUploading && setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl sm:rounded-4xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Upload Memories</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div
                {...getRootProps()}
                className={`group relative cursor-pointer rounded-2xl sm:rounded-4xl border-2 border-dashed p-6 sm:p-10 text-center transition-all ${
                  isDragActive 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10" 
                    : "border-slate-200 hover:border-indigo-400 dark:border-slate-700"
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <Upload size={24} className="sm:w-8 sm:h-8" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 font-bold">
                  {isDragActive ? "Thả vào đây!" : "Kéo ảnh vào hoặc click để chọn"}
                </p>
                <p className="mt-2 text-[10px] text-slate-400">Max 5MB (JPG, PNG, WEBP)</p>
              </div>

              {files.length > 0 && (
                <div className="mt-6 max-h-40 sm:max-h-60 overflow-y-auto pr-2">
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {files.map((file) => (
                      <div key={file.name} className="group relative aspect-square">
                        <img
                          src={file.preview}
                          alt="Preview"
                          className="h-full w-full rounded-xl sm:rounded-2xl object-cover"
                        />
                        <button
                          onClick={() => removeFile(file.name)}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isUploading}
                  className="flex-1 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 py-3 sm:py-4 text-xs sm:text-sm font-black text-slate-900 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 py-3 sm:py-4 text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : null}
                  {isUploading ? "Đang tải..." : `Tải lên ${files.length} ảnh`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
