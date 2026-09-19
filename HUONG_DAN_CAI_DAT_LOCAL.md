# HƯỚNG DẪN CÀI ĐẶT & CẤU HÌNH DỰ ÁN TRÊN MÁY CÁ NHÂN (LOCAL MACHINE)
# HỆ THỐNG CĂNG TIN ĐẠI HỌC - UNIEAT CAMPUS

Chào bạn, toàn bộ mã nguồn dự án đã được tổ chức phân tách hoàn chỉnh theo đúng cấu trúc chuẩn **Frontend (ReactJS + Vite)** và **Backend (NodeJS + Express + MySQL + Socket.IO)**:

```text
vocabulary-app/ (hoặc unieat-campus/)
│
├── frontend/                 # Ứng dụng ReactJS Client (Chạy port 5173)
│   ├── public/               # Tài nguyên tĩnh (favicon, icon)
│   ├── src/
│   │   ├── assets/           # Hình ảnh, icon, font chữ
│   │   ├── components/       # UI Components dùng chung (Header, Navbar, Modals...)
│   │   ├── config/           # Hằng số constants.ts (mock data, địa chỉ API)
│   │   ├── features/         # Module nghiệp vụ lõi (auth, menu, cart, orders, wallet)
│   │   ├── hooks/            # Custom hooks (useAuth, useCart, useDebounce, useSocket)
│   │   ├── layouts/          # Khung giao diện (MainLayout, AuthLayout)
│   │   ├── pages/            # Các trang chính (Home, Menu, Cart, Checkout, Admin, Staff...)
│   │   ├── routes/           # Điều hướng phân trang (AppRoutes.tsx)
│   │   ├── services/         # Client gọi API (Axios/fetch instance, Socket.IO client)
│   │   ├── store/            # Quản lý State toàn cục (AppContext.tsx)
│   │   ├── types/            # TypeScript Interfaces / Types
│   │   └── utils/            # Hàm tiện ích (formatVND, dateUtils)
│   ├── .env                  # File cấu hình biến môi trường Frontend
│   ├── .env.example          # File mẫu biến môi trường Frontend
│   ├── package.json          # Dependencies & Scripts Frontend
│   ├── tsconfig.json         # Cấu hình TypeScript Frontend
│   └── vite.config.ts        # Cấu hình Vite & Proxy API chống lỗi CORS
│
└── backend/                  # Máy chủ Node.js/Express API (Chạy port 5000)
    ├── database.sql          # Toàn bộ mã tạo Database MySQL & dữ liệu mẫu
    ├── src/
    │   ├── config/           # ⭐ ĐOẠN CẦN CONFIG: db.config, jwt, cloudinary, payment, socket.config
    │   ├── controllers/      # Bộ điều phối Request/Response (Auth, Menu, Order, Payment...)
    │   ├── middlewares/      # Lớp trung gian (Auth JWT, ErrorHandler, Logger, Validate)
    │   ├── models/           # Cấu trúc thực thể dữ liệu (User, Product, Order, Payment, Table)
    │   ├── routes/           # Định tuyến API endpoints (/api/auth, /api/orders...)
    │   ├── services/         # Logic nghiệp vụ lõi (AuthService, PaymentService...)
    │   ├── socket/           # ⚡ REAL-TIME WEBSOCKET: index.ts, order.socket, notification.socket, table.socket
    │   ├── validations/      # Kiểm tra hợp lệ dữ liệu đầu vào (AuthValidation, OrderValidation)
    │   ├── types/            # TypeScript Types phía server
    │   └── utils/            # Hàm tiện ích (Logger, Response formatter)
    ├── .env                  # ⭐ ĐOẠN CẦN CONFIG: Biến môi trường Backend
    ├── .env.example          # File mẫu biến môi trường Backend
    ├── package.json          # Dependencies & Scripts Backend
    └── tsconfig.json         # Cấu hình TypeScript Backend
```

---

## 📌 PHẦN 1: TỔNG HỢP CÁC ĐOẠN BẠN CẦN CẤU HÌNH TRÊN MÁY CỦA BẠN

Dưới đây là danh sách chi tiết các tệp và tham số bạn chỉ việc chỉnh sửa cho khớp với phần mềm trên máy tính cá nhân của bạn:

### 1.1. Cấu hình Backend: File `backend/.env`
Mở file `backend/.env` trên máy bạn và chỉnh sửa các dòng sau:

```env
# 1. CỔNG SERVER NODEJS
PORT=5000
NODE_ENV=development

# 2. CẤU HÌNH DATABASE MYSQL TRÊN MÁY BẠN (XAMPP / Laragon / MySQL Service):
# - DB_HOST: Giữ nguyên 'localhost'
# - DB_PORT: 3306 (nếu XAMPP bạn đổi sang 3307 thì sửa thành 3307)
# - DB_USER: Mặc định XAMPP/Laragon là 'root'
# - DB_PASSWORD: Nếu dùng XAMPP thì để trống, nếu bạn có đặt mật khẩu thì điền vào đây
# - DB_NAME: Tên database bạn tạo trong phpMyAdmin (ví dụ: unieat_db)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=unieat_db

# 3. MÃ BÍ MẬT BẢO MẬT JWT (Đổi thành chuỗi bảo mật bất kỳ tùy thích)
JWT_SECRET=unieat_campus_secret_key_local_machine_2026
JWT_EXPIRES_IN=7d

# 4. ĐỊA CHỈ URL FRONTEND ĐƯỢC PHÉP TRUY CẬP (CORS)
CLIENT_URL=http://localhost:5173

# 5. CẤU HÌNH CLOUDINARY (Lưu ảnh món ăn - Nếu có tài khoản thì điền, không thì giữ nguyên mẫu)
CLOUDINARY_CLOUD_NAME=unieat-campus
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=local_cloudinary_secret_key

# 6. CỔNG THANH TOÁN THỬ NGHIỆM VNPAY & MOMO (Sandbox)
VNPAY_TMN_CODE=UNIEAT01
VNPAY_HASH_SECRET=LOCAL_DEV_VNPAY_SECRET
MOMO_PARTNER_CODE=MOMO_UNIEAT
```

---

### 1.2. Cấu hình Database MySQL: File `backend/database.sql`
1. Khởi động **MySQL** trên máy của bạn (Ví dụ: Bật module **MySQL** trên bảng điều khiển **XAMPP Control Panel** hoặc **Laragon**).
2. Mở trình duyệt vào **phpMyAdmin** (`http://localhost/phpmyadmin`) hoặc phần mềm **Navicat / DBeaver / MySQL Workbench / HeidiSQL**.
3. Tạo 1 cơ sở dữ liệu mới có tên:
   ```sql
   CREATE DATABASE `unieat_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Chọn database `unieat_db` vừa tạo -> Bấm tab **Import** (Nhập) -> Chọn file `backend/database.sql` và bấm **Go** (Thực hiện).
   *(Hoặc nếu dùng cửa sổ dòng lệnh Terminal/CMD: `mysql -u root -p unieat_db < backend/database.sql`)*.
5. Sau khi import thành công, bạn sẽ thấy đầy đủ 14 bảng dữ liệu: `users`, `products`, `orders`, `order_details`, `dining_tables`, `payments`, `vouchers`... cùng dữ liệu mẫu sẵn có.

---

### 1.3. Cấu hình Frontend: File `frontend/.env`
Mở file `frontend/.env` trên máy bạn:

```env
# Địa chỉ gọi API sang server Node.js:
VITE_API_URL=http://localhost:5000/api

# Địa chỉ máy chủ Socket.IO Realtime:
VITE_SOCKET_URL=http://localhost:5000

# Tên ứng dụng
VITE_APP_NAME="UniEat - Căng Tin Đại Học"
```

> **Lưu ý chống lỗi CORS**: Trong file `frontend/vite.config.ts`, tôi đã cấu hình sẵn tính năng `proxy` tự động: Mọi request gọi tới `/api` sẽ tự động được chuyển tiếp sang `http://localhost:5000` ngầm định, giúp bạn chạy local mượt mà không bao giờ bị chặn CORS!

---

### 1.4. Cấu hình Socket.IO Real-time: File `backend/src/config/socket.config.ts` & Thư mục `backend/src/socket/`
Nếu bạn muốn tùy chỉnh cấu hình WebSocket trên máy:
- **`backend/src/config/socket.config.ts`**: Chứa toàn bộ cấu hình CORS (`CLIENT_URL`), đường dẫn endpoint (`/socket.io`), phương thức `transports: ['websocket', 'polling']`, thời gian timeout ping (`60s`), và danh sách các sự kiện (`order:new`, `order:status_updated`, `table:occupied`, `notification:received`).
- **`backend/src/socket/`**: Thư mục chuyên trách xử lý các sự kiện real-time:
  - `index.ts`: Khởi tạo Socket.IO server và quản lý phân luồng kết nối theo Role (Sinh viên, Bếp, Admin).
  - `order.socket.ts`: Chuông báo đơn hàng mới cho bếp, cập nhật tiến độ làm món cho sinh viên.
  - `notification.socket.ts`: Bắn thông báo nạp ví, voucher khuyến mãi, flash sale toàn trường.
  - `table.socket.ts`: Cập nhật trạng thái bàn ăn tức thì khi sinh viên quét mã QR.

---

### 1.5. Cấu hình Redis Cache & Session: File `backend/src/config/redis.config.ts` & `backend/src/services/redis.service.ts`
Hệ thống đã chuẩn bị sẵn module cấu hình và service tiện ích cho Redis:
- **`REDIS_ENABLED`**: Mặc định là `false`. Hệ thống có sẵn cơ chế tự động **Fallback In-Memory Cache**, nên nếu bạn chưa cài Redis thì server vẫn chạy bình thường 100% không lo bị lỗi crash!
- **Khi muốn dùng Redis thật**:
  1. Chạy Redis trên máy (Ví dụ dùng Docker: `docker run -d --name redis-unieat -p 6379:6379 redis:alpine`).
  2. Đổi `REDIS_ENABLED=true` trong file `backend/.env`.
  3. Cấu hình sẵn các TTL (thời gian sống của cache): Menu (30p), Bestsellers (10p), Flash sale (5p), Session (7 ngày), cùng các tiền tố key (`unieat:cache:`, `unieat:ratelimit:`, `unieat:session:`).
  4. Cung cấp sẵn các hàm tiện ích: `get()`, `set()`, `del()`, `exists()` và phương thức Cache-Aside `remember()`.

---

## 🚀 PHẦN 2: CÁC BƯỚC KHỞI ĐỘNG DỰ ÁN TRÊN MÁY BẠN

Sau khi tải code về máy, bạn mở 2 cửa sổ dòng lệnh (Terminal / CMD / PowerShell):

### Bước 1: Khởi động Backend (Cửa sổ Terminal 1)
```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện cần thiết
npm install

# 3. Chạy máy chủ ở chế độ phát triển (Auto-reload khi sửa code)
npm run dev
```
👉 Kết quả màn hình hiển thị:
```text
🚀 UniEat Campus Backend Server đang chạy!
📡 URL API: http://localhost:5000/api
⚡ Socket.IO Real-time: http://localhost:5000
🌐 Frontend Allowed: http://localhost:5173
```

---

### Bước 2: Khởi động Frontend (Cửa sổ Terminal 2)
```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện giao diện
npm install

# 3. Chạy máy chủ giao diện Vite
npm run dev
```
👉 Kết quả màn hình hiển thị:
```text
  VITE v6.2.3  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Bây giờ bạn chỉ cần mở trình duyệt vào địa chỉ **`http://localhost:5173`** là có thể sử dụng toàn bộ hệ thống!

---

## 🔑 PHẦN 3: TÀI KHOẢN ĐĂNG NHẬP MẪU SẴN CÓ

Hệ thống đã có sẵn các tài khoản demo (mật khẩu mặc định: `123456`):

1. **Tài khoản Sinh viên**:
   - Email: `minh.dh22@university.edu.vn`
   - Quyền: `STUDENT` (Đặt món mang về, giao KTX, ăn tại bàn quét QR, nạp ví, theo dõi đơn real-time).

2. **Tài khoản Nhân viên Căng tin**:
   - Email: `bep.truong@university.edu.vn`
   - Quyền: `STAFF` (Màn hình bếp nhận chuông báo đơn mới qua Socket.IO, cập nhật trạng thái làm món).

3. **Tài khoản Quản trị viên (Admin)**:
   - Email: `admin@university.edu.vn`
   - Quyền: `ADMIN` (Thống kê doanh thu, quản lý thực đơn, quản lý bàn ăn QR, tạo voucher khuyến mãi).
