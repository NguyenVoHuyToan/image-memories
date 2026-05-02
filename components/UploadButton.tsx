"use client";

import { useState, useCallback, memo, useRef } from "react";
import { Upload, Plus, X, Loader2, AlertTriangle, CheckCircle2, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImageAction } from "@/lib/actions/imageActions";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 10;
const COMPRESSION_OPTIONS = {
  maxWidthOrHeight: 1920,
  initialQuality: 0.8,
  useWebWorker: true,
};

// ─── Types ───────────────────────────────────────────────────────────────────
type FileStatus = "pending" | "compressing" | "uploading" | "done" | "error" | "oversized";

interface ManagedFile {
  id: string;
  raw: File;
  preview: string;
  name: string;
  sizeMB: number;
  status: FileStatus;
  progress: number; // 0–100
  errorMsg?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

async function compressFile(file: File): Promise<File> {
  try {
    // Dynamically import to avoid SSR issues
    const imageCompression = (await import("browser-image-compression")).default;
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    // If compression fails, return original file
    return file;
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface UploadButtonProps {
  albumId: string;
  onSuccess: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
function UploadButton({ albumId, onSuccess }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ── Drop handler ──
  const onDrop = useCallback((accepted: File[]) => {
    const mapped: ManagedFile[] = accepted.map((f) => ({
      id: genId(),
      raw: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      sizeMB: f.size / (1024 * 1024),
      status: f.size > MAX_FILE_SIZE_BYTES ? "oversized" : "pending",
      progress: 0,
      errorMsg: f.size > MAX_FILE_SIZE_BYTES ? `Dung lượng > ${MAX_FILE_SIZE_MB}MB` : undefined,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: MAX_FILES,
    multiple: true,
    // No maxSize here — we handle it manually per-file for granular feedback
    onDropRejected: (rejections) => {
      const tooMany = rejections.some((r) => r.errors.some((e) => e.code === "too-many-files"));
      toast.error(tooMany ? `Tối đa ${MAX_FILES} ảnh một lần` : "File không hợp lệ");
    },
  });

  // ── File management ──
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFile = useCallback((id: string, patch: Partial<ManagedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  // ── Upload ──
  const handleUpload = useCallback(async () => {
    const validFiles = files.filter((f) => f.status === "pending");
    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Track outcomes locally to avoid async state reading issues
    const resultMap = new Map<string, "done" | "error">();

    // Mark all valid files as compressing
    validFiles.forEach((f) => updateFile(f.id, { status: "compressing", progress: 10 }));

    // Compress all files FIRST (sequentially to avoid overloading WebWorker)
    const compressedPairs: { id: string; file: File; name: string }[] = [];
    for (const mf of validFiles) {
      const compressed = await compressFile(mf.raw);
      compressedPairs.push({ id: mf.id, file: compressed, name: mf.name });
      updateFile(mf.id, { status: "uploading", progress: 30 });
    }

    // Upload in PARALLEL
    const uploadTasks = compressedPairs.map(async ({ id, file, name }) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", name.split(".")[0]);
        formData.append("albumId", albumId);

        // Simulate incremental progress while server is processing
        const progressTimer = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id && f.progress < 90 ? { ...f, progress: f.progress + 8 } : f
            )
          );
        }, 400);

        const result = await uploadImageAction(formData);
        clearInterval(progressTimer);

        if (result.success) {
          updateFile(id, { status: "done", progress: 100 });
          resultMap.set(id, "done");
        } else {
          updateFile(id, { status: "error", progress: 0, errorMsg: result.error ?? "Upload thất bại" });
          resultMap.set(id, "error");
        }
      } catch (err: any) {
        updateFile(id, { status: "error", progress: 0, errorMsg: err.message ?? "Lỗi hệ thống" });
        resultMap.set(id, "error");
      }
    });

    await Promise.allSettled(uploadTasks);
    setIsUploading(false);

    // Summarize results from local map (no async state read)
    const done = [...resultMap.values()].filter((v) => v === "done").length;
    const failed = [...resultMap.values()].filter((v) => v === "error").length;

    if (done > 0) {
      toast.success(`${done} ảnh đã tải lên thành công!`);
      onSuccess();
    }
    if (failed > 0) {
      toast.error(`${failed} ảnh tải thất bại, vui lòng thử lại.`);
    }

    // Clean up: remove successful uploads from list; keep errors for retry
    setFiles((prev) => prev.filter((f) => f.status !== "done"));
    if (failed === 0) setIsOpen(false);
  }, [files, albumId, onSuccess, updateFile]);

  // ── Derived state ──
  const validCount = files.filter((f) => f.status === "pending").length;
  const oversizedCount = files.filter((f) => f.status === "oversized").length;
  const hasFiles = files.length > 0;
  const canUpload = validCount > 0 && !isUploading;

  const handleClose = useCallback(() => {
    if (isUploading) return;
    setFiles([]);
    setIsOpen(false);
  }, [isUploading]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-600 px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Plus size={18} />
        <span className="hidden sm:block">New Memory</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              onClick={handleClose}
            />

            {/* Sheet / Modal */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CloudUpload size={22} className="text-indigo-500" />
                    Upload Memories
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Tối đa {MAX_FILES} ảnh · {MAX_FILE_SIZE_MB}MB mỗi tấm
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dropzone */}
              {!hasFiles && (
                <div className="px-6 sm:px-8 pb-2">
                  <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                      isDragActive
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                      <Upload size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {isDragActive ? "Thả ảnh vào đây!" : "Kéo ảnh vào hoặc click để chọn"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400 uppercase tracking-widest">JPG · PNG · WEBP</p>
                  </div>
                </div>
              )}

              {/* File List */}
              {hasFiles && (
                <div className="px-6 sm:px-8 pb-2">
                  {/* Add more button */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {validCount} hợp lệ
                      {oversizedCount > 0 && (
                        <span className="ml-2 text-rose-400">{oversizedCount} quá dung lượng</span>
                      )}
                    </span>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors">
                        + Thêm ảnh
                      </button>
                    </div>
                  </div>

                  {/* File cards */}
                  <div className="max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-2">
                    <AnimatePresence>
                      {files.map((mf) => (
                        <motion.div
                          key={mf.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            mf.status === "oversized" || mf.status === "error"
                              ? "border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-800"
                              : mf.status === "done"
                              ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800"
                              : "border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                            <img
                              src={mf.preview}
                              alt={mf.name}
                              className="h-full w-full object-cover"
                            />
                            {(mf.status === "oversized" || mf.status === "error") && (
                              <div className="absolute inset-0 bg-rose-500/60 flex items-center justify-center">
                                <AlertTriangle size={18} className="text-white" />
                              </div>
                            )}
                            {mf.status === "done" && (
                              <div className="absolute inset-0 bg-emerald-500/60 flex items-center justify-center">
                                <CheckCircle2 size={18} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{mf.name}</p>
                            <p className={`text-[10px] font-bold mt-0.5 ${
                              mf.status === "oversized" || mf.status === "error"
                                ? "text-rose-500"
                                : "text-slate-400"
                            }`}>
                              {mf.status === "oversized"
                                ? `❌ Dung lượng > ${MAX_FILE_SIZE_MB}MB`
                                : mf.status === "error"
                                ? `❌ ${mf.errorMsg}`
                                : mf.status === "done"
                                ? "✅ Đã tải lên"
                                : mf.status === "compressing"
                                ? "🔧 Đang nén ảnh..."
                                : mf.status === "uploading"
                                ? `☁️ Đang tải... ${mf.progress}%`
                                : `${mf.sizeMB.toFixed(1)} MB`}
                            </p>

                            {/* Progress bar */}
                            {(mf.status === "compressing" || mf.status === "uploading") && (
                              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-indigo-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${mf.progress}%` }}
                                  transition={{ ease: "easeOut" }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Remove */}
                          {!isUploading && mf.status !== "done" && (
                            <button
                              onClick={() => removeFile(mf.id)}
                              className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="flex-1 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!canUpload}
                  className="flex-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <CloudUpload size={16} />
                      {canUpload ? `Tải lên ${validCount} ảnh` : "Chọn ảnh để tải"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(UploadButton);
