import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap", // Tránh layout shift khi load font
});

// Cấu hình SEO chuyên sâu
export const metadata: Metadata = {
  title: {
    default: "Memories - Lưu giữ khoảnh khắc cuộc sống",
    template: "%s | Memories"
  },
  description: "Ứng dụng lưu trữ hình ảnh cá nhân hiện đại, bảo mật và tốc độ cao. Nơi bảo tồn những kỷ niệm quý giá của bạn.",
  keywords: ["memories", "lưu trữ ảnh", "cloud storage", "kỷ niệm", "album ảnh online"],
  authors: [{ name: "Nguyen Vo Huy Toan" }],
  creator: "Nguyen Vo Huy Toan",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://memories-app.vercel.app", // Thay bằng domain thật khi deploy
    title: "Memories - Không gian lưu trữ kỷ niệm riêng tư",
    description: "Nền tảng tuyệt vời nhất để tổ chức và sống lại những khoảnh khắc đẹp nhất của bạn.",
    siteName: "Memories App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Memories App",
    description: "Lưu giữ khoảnh khắc cuộc sống theo cách hiện đại nhất.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Cho phép zoom cho accessibility nhưng giữ layout ổn định
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
        <AuthProvider>
          <Providers>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
