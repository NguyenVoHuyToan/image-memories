import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

// Helper to sanitize NEXTAUTH_URL
const getNextAuthUrl = () => {
  const url = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("🔑 [Auth] Missing email or password");
            return null;
          }

          console.log(`🔑 [Auth] Attempting login for: ${credentials.email}`);
          
          await dbConnect();

          // 1. Tìm user (toLowerCase để khớp với cơ sở dữ liệu)
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");
          
          if (!user) {
            console.log(`❌ [Auth] User not found: ${credentials.email}`);
            return null;
          }

          console.log(`✅ [Auth] User found: ${user.username}`);

          // 2. So sánh mật khẩu
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          
          if (!isMatch) {
            console.log(`❌ [Auth] Password mismatch for: ${credentials.email}`);
            return null;
          }

          console.log(`✅ [Auth] Login successful for: ${credentials.email}`);

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
          };
        } catch (error: any) {
          console.error("🔥 [Auth] Authorize Error:", error.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Đảm bảo secret tồn tại
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
