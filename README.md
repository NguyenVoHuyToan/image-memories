📸 Memories App
Memories App là một ứng dụng web hiện đại cho phép người dùng lưu trữ, quản lý và chia sẻ những khoảnh khắc đáng nhớ thông qua các album hình ảnh sinh động. Dự án được tối ưu hóa cho hiệu suất cao, giao diện responsive và trải nghiệm người dùng mượt mà.

🚀 Tính năng nổi bật
Quản lý Album thông minh: Tạo, đặt tên và tổ chức hình ảnh theo từng album riêng biệt.

Điều hướng nhanh: Hệ thống Filter Album với logic smooth scroll, giúp truy cập nhanh đến nội dung cần thiết.

Tối ưu hóa Upload:

Tự động nén ảnh tại Client giúp tăng tốc độ tải lên.

Validation dung lượng file (giới hạn 5MB) với cảnh báo UI trực quan.

Hỗ trợ tải lên nhiều ảnh cùng lúc (Parallel Upload).

Hiệu suất vượt trội:

Áp dụng Lazy Loading và tối ưu hóa thẻ Image của Next.js.

Xử lý thanh cuộn nội bộ cho từng album khi số lượng ảnh vượt quá 10 tấm.

Bảo mật & Xác thực: Tích hợp NextAuth cho phép đăng ký/đăng nhập an toàn.

🛠 Công nghệ sử dụng
Frontend: Next.js 14 (App Router), Tailwind CSS, TypeScript.

Backend: Next.js API Routes.

Database: MongoDB Atlas (thông qua Mongoose).

Storage: Cloudinary (Quản lý hình ảnh).

Authentication: NextAuth.js.

📦 Cài đặt dự án

1. Clone dự án
   Bash
   git clone https://github.com/NguyenVoHuyToan/image-memories.git
   cd image-memories
2. Cài đặt thư viện
   Bash
   npm install

# hoặc

yarn install 3. Cấu hình biến môi trường
Tạo file .env.local tại thư mục gốc và cấu hình các thông số sau:

Đoạn mã

# Database

MONGODB_URI=your_mongodb_connection_string

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Lưu ý: Đảm bảo MONGODB_URI không chứa các ký tự đặc biệt như < > trong mật khẩu.

4. Chạy dự án ở chế độ Development
   Bash
   npm run dev
   Truy cập http://localhost:3000 để xem kết quả.

📐 Cấu trúc thư mục chính
/app: Chứa logic chính của ứng dụng (Pages, API Routes).

/components: Các thành phần UI tái sử dụng (AlbumCard, UploadForm, Filter...).

/lib: Cấu hình kết nối MongoDB và các hàm tiện ích.

/public: Chứa các tài nguyên tĩnh như hình ảnh, icons.

🤝 Đóng góp
Fork dự án.

Tạo nhánh tính năng mới (git checkout -b feat/AmazingFeature).

Commit thay đổi (git commit -m 'Add some AmazingFeature').

Push lên nhánh (git push origin feat/AmazingFeature).

Mở một Pull Request.

Phát triển bởi Nguyen Vo Huy Toan - UI Developer chuyên về Next.js & React.
