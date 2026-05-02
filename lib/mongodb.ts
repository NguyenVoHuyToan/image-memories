import mongoose from 'mongoose';

/**
 * Hàm hỗ trợ URL Encode password nếu người dùng chưa encode
 * Giúp tránh lỗi "bad auth : authentication failed" khi mật khẩu chứa ký tự đặc biệt (@, #, !, ...)
 */
function getSecureUri(uri: string): string {
  try {
    // Regex để tách phần: Protocol, User, Password, và Host
    const regex = /^(mongodb(?:\+srv)?:\/\/[^:]+:)(.*)(@.*)$/;
    const match = uri.match(regex);

    if (match) {
      const protocolAndUser = match[1]; // e.g. "mongodb+srv://admin:"
      const password = match[2];        // e.g. "P@ssw0rd!"
      const rest = match[3];            // e.g. "@cluster0.mongodb.net/db"

      // Chỉ encode nếu mật khẩu chưa được encode (không chứa %)
      const encodedPassword = password.includes('%') ? password : encodeURIComponent(password);
      
      return `${protocolAndUser}${encodedPassword}${rest}`;
    }
  } catch (err) {
    console.error("⚠️ Error parsing MONGODB_URI for encoding:", err);
  }
  return uri;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ CRITICAL ERROR: process.env.MONGODB_URI is undefined!');
  throw new Error('Bạn chưa cấu hình biến môi trường MONGODB_URI. Hãy kiểm tra lại Tab Environment Variables trên Vercel hoặc file .env.local.');
}

const FINAL_URI = getSecureUri(MONGODB_URI);

/** 
 * Singleton Pattern for Serverless Environment (Vercel)
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Giới hạn pool size cho Atlas Free Tier
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Debugging (Bảo mật: Chỉ log phần cluster, không log password)
    try {
      const clusterInfo = FINAL_URI.split('@')[1] || "Unknown Cluster";
      console.log(`📡 Đang kết nối tới Cluster: ${clusterInfo.split('/')[0]}`);
    } catch (e) {
      console.log("📡 Đang chuẩn bị kết nối tới MongoDB...");
    }

    cached!.promise = mongoose.connect(FINAL_URI, opts).then((mongooseInstance) => {
      console.log('✅ Kết nối MongoDB thành công.');
      return mongooseInstance;
    }).catch((error) => {
      // Phân loại lỗi chi tiết theo yêu cầu
      if (error.code === 8000 || error.message.includes('Authentication failed')) {
        console.error('❌ LỖI XÁC THỰC (Code 8000): Mật khẩu hoặc Username không đúng. Hãy kiểm tra lại ký tự đặc biệt hoặc cấu hình whitelist IP trên Atlas.');
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
        console.error('❌ LỖI KẾT NỐI: Không thể kết nối tới server (Timeout/Refused). Có thể do lỗi mạng hoặc IP chưa được Whitelist trên Atlas.');
      } else {
        console.error('❌ LỖI MONGOOSE:', error.message);
      }
      
      cached!.promise = null; // Reset để có thể thử lại ở lần request sau
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null; // Tránh việc cache promise lỗi vĩnh viễn
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
