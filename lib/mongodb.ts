import mongoose from 'mongoose';

/**
 * Hàm hỗ trợ URL Encode password nếu người dùng chưa encode
 * Giúp tránh lỗi "bad auth" khi mật khẩu chứa ký tự đặc biệt (@, #, !, ...)
 */
function getSecureUri(uri: string): string {
  try {
    const regex = /^(mongodb(?:\+srv)?:\/\/[^:]+:)(.*)(@.*)$/;
    const match = uri.match(regex);
    if (match) {
      const protocolAndUser = match[1]; 
      const password = match[2];        
      const rest = match[3];            
      const encodedPassword = password.includes('%') ? password : encodeURIComponent(password);
      return `${protocolAndUser}${encodedPassword}${rest}`;
    }
  } catch (err) {
    console.warn("⚠️ MONGODB_URI format might be unusual, proceeding as is.");
  }
  return uri;
}

// Log an toàn để kiểm tra sự tồn tại của biến môi trường (không log giá trị)
console.log("Checking MONGODB_URI presence:", !!process.env.MONGODB_URI);

const rawUri = process.env.MONGODB_URI;

// Kiểm tra nghiêm ngặt sự tồn tại của URI
if (!rawUri) {
  console.error("❌ CRITICAL ERROR: MONGODB_URI is missing in environment variables!");
  throw new Error("MONGODB_URI is missing in environment variables. Please check your .env.local or Vercel settings.");
}

// Dùng .trim() để loại bỏ các ký tự trắng vô hình có thể gây lỗi Invalid Scheme
const MONGODB_URI = rawUri.trim();

const FINAL_URI = getSecureUri(MONGODB_URI);

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
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Tăng thời gian chờ lên 10s
    };

    cached!.promise = mongoose.connect(FINAL_URI, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB Connected successfully.');
      return mongooseInstance;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      cached!.promise = null; 
      throw error;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
