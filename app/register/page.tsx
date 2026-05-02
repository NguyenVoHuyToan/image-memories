"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Loader2, AlertCircle, Mail, User, Lock } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  username: z.string().min(2, "Tên người dùng phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Đã xảy ra lỗi");
      }

      toast.success("Đăng ký thành công! Hãy đăng nhập.");
      router.push("/login");
    } catch (err: any) {
      setServerError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl shadow-indigo-500/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-violet-500/20">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Tham gia với chúng tôi</h1>
          <p className="text-slate-500 font-bold text-sm mt-2">Bắt đầu lưu trữ những khoảnh khắc tuyệt vời nhất</p>
        </div>
        
        {serverError && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 mb-6 text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={18} />
            {serverError}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-full">
            <Label htmlFor="username" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Tên hiển thị</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                id="username" 
                {...register("username")} 
                className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold"
                placeholder="Ví dụ: Hoàng Anh"
              />
            </div>
            {errors.username && <p className="text-xs font-bold text-rose-500 ml-1">{errors.username.message}</p>}
          </div>

          <div className="space-y-2 col-span-full">
            <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold"
                placeholder="email@example.com"
              />
            </div>
            {errors.email && <p className="text-xs font-bold text-rose-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2 col-span-full">
            <Label htmlFor="password" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Mật khẩu</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                id="password" 
                type="password" 
                {...register("password")} 
                className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-bold"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-xs font-bold text-rose-500 ml-1">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="col-span-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black shadow-xl shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
            {isSubmitting ? "Đang khởi tạo..." : "Tạo tài khoản ngay"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-500">
          Đã có tài khoản? <Link href="/login" className="text-violet-600 hover:underline">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
