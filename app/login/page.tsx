"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Using sonner for better feedback if available
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email.toLowerCase(),
        password: data.password,
      });

      if (res?.error) {
        // NextAuth returns a generic error string. Let's map it to something clearer.
        if (res.status === 401) {
          setServerError("Sai email hoặc mật khẩu. Vui lòng thử lại.");
          toast.error("Đăng nhập thất bại: Sai thông tin!");
        } else {
          setServerError("Đã xảy ra lỗi không xác định trong quá trình đăng nhập.");
          toast.error("Lỗi xác thực hệ thống.");
        }
      } else {
        toast.success("Đăng nhập thành công! Đang chuyển hướng...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setServerError("Lỗi kết nối đến máy chủ.");
      toast.error("Lỗi mạng.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chào mừng trở lại</h1>
          <p className="text-slate-500 font-bold text-sm mt-2">Đăng nhập để quản lý album ảnh của bạn</p>
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")} 
              className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs font-bold text-rose-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="password" className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              {...register("password")} 
              className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-xs font-bold text-rose-500 ml-1">{errors.password.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập ngay"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-slate-500">
          Chưa có tài khoản? <Link href="/register" className="text-indigo-600 hover:underline">Đăng ký thành viên</Link>
        </p>
      </motion.div>
    </div>
  );
}
