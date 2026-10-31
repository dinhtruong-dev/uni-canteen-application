# HƯỚNG DẪN CÀI ĐẶT VÀ CẤU HÌNH DỰ ÁN TRÊN MÁY TÍNH CÁ NHÂN (LOCAL MACHINE)
# HỆ THỐNG QUẢN LÝ CĂNG TIN ĐẠI HỌC – UNIEAT CAMPUS

## GIỚI THIỆU

Toàn bộ mã nguồn của dự án UniEat Campus được tổ chức và phân chia theo kiến trúc Frontend – Backend, đảm bảo tính độc lập giữa các thành phần, thuận tiện cho quá trình phát triển, bảo trì và mở rộng hệ thống.

Công nghệ được sử dụng trong dự án:

- **Frontend:** ReactJS, Vite, TypeScript.
- **Backend:** NodeJS, ExpressJS, TypeScript.
- **Database:** MySQL.
- **Real-time:** Socket.IO.
- **Cache:** Redis (tùy chọn).

Cấu trúc tổng thể của dự án được tổ chức như sau:

```text
vocabulary-app/ (hoặc unieat-campus/)
│
├── frontend/                 # Ứng dụng ReactJS Client (Port 5173)
│   ├── public/               # Tài nguyên tĩnh (favicon, icon)
│   ├── src/
│   │   ├── assets/           # Hình ảnh, icon, font chữ
│   │   ├── components/       # UI Components dùng chung
│   │   ├── config/           # Cấu hình hệ thống và dữ liệu mẫu
│   │   ├── features/         # Các module nghiệp vụ
│   │   ├── hooks/            # Custom Hooks
│   │   ├── layouts/          # Các bố cục giao diện
│   │   ├── pages/            # Các trang chức năng
│   │   ├── routes/           # Cấu hình điều hướng
│   │   ├── services/         # Các dịch vụ kết nối API
│   │   ├── store/            # Quản lý trạng thái toàn cục
│   │   ├── types/            # Định nghĩa TypeScript Types
│   │   └── utils/            # Các hàm tiện ích
│   ├── .env                  # Biến môi trường Frontend
│   ├── .env.example          # Tệp cấu hình mẫu Frontend
│   ├── package.json          # Dependencies và Scripts
│   ├── tsconfig.json         # Cấu hình TypeScript
│   └── vite.config.ts        # Cấu hình Vite và Proxy API
│
└── backend/                  # Máy chủ NodeJS/Express API (Port 5000)
    ├── database.sql          # Cấu trúc Database và dữ liệu mẫu
    ├── src/
    │   ├── config/           # Các tệp cấu hình hệ thống
    │   ├── controllers/      # Xử lý Request/Response
    │   ├── middlewares/      # Các Middleware
    │   ├── models/           # Các mô hình dữ liệu
    │   ├── routes/           # Định tuyến API
    │   ├── services/         # Xử lý logic nghiệp vụ
    │   ├── socket/           # Xử lý sự kiện Socket.IO
    │   ├── validations/      # Kiểm tra dữ liệu đầu vào
    │   ├── types/            # Định nghĩa TypeScript Types
    │   └── utils/            # Các hàm tiện ích
    ├── .env                  # Biến môi trường Backend
    ├── .env.example          # Tệp cấu hình mẫu Backend
    ├── package.json          # Dependencies và Scripts
    └── tsconfig.json         # Cấu hình TypeScript
```

---

## PHẦN 1: TỔNG HỢP CÁC THÀNH PHẦN CẦN CẤU HÌNH TRÊN MÁY TÍNH CÁ NHÂN

Trước khi khởi chạy dự án, cần kiểm tra và thiết lập các thông số cấu hình phù hợp với môi trường phát triển trên máy tính cá nhân.

Các tệp cấu hình chính bao gồm: `backend/.env`, `frontend/.env`, cấu hình cơ sở dữ liệu MySQL và các thành phần dịch vụ liên quan.

### 1.1. Cấu hình Backend: File `backend/.env`

Tệp `backend/.env` chứa các biến môi trường phục vụ quá trình vận hành máy chủ Backend, bao gồm cổng kết nối, thông tin cơ sở dữ liệu, khóa bảo mật JWT, cấu hình CORS và các dịch vụ tích hợp bên ngoài.

Mở tệp `backend/.env` và thiết lập các thông số như sau:

```env
# 1. CẤU HÌNH MÁY CHỦ NODEJS
PORT=5000
NODE_ENV=development

# 2. CẤU HÌNH KẾT NỐI DATABASE MYSQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=unieat_db

# 3. CẤU HÌNH XÁC THỰC JWT
JWT_SECRET=unieat_campus_secret_key_local_machine_2026
JWT_EXPIRES_IN=7d

# 4. CẤU HÌNH CORS
CLIENT_URL=http://localhost:5173

# 5. CẤU HÌNH CLOUDINARY
CLOUDINARY_CLOUD_NAME=unieat-campus
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=local_cloudinary_secret_key

# 6. CẤU HÌNH THANH TOÁN VNPAY VÀ MOMO (SANDBOX)
VNPAY_TMN_CODE=UNIEAT01
VNPAY_HASH_SECRET=LOCAL_DEV_VNPAY_SECRET
MOMO_PARTNER_CODE=MOMO_UNIEAT
```

**Giải thích các thông số cấu hình:**

**Nhóm 1 – Máy chủ NodeJS**

- `PORT`: Cổng hoạt động của Backend, mặc định là `5000`.
- `NODE_ENV`: Môi trường thực thi ứng dụng. Giá trị `development` được sử dụng trong quá trình phát triển.

**Nhóm 2 – Database MySQL**

- `DB_HOST`: Địa chỉ máy chủ MySQL, mặc định là `localhost`.
- `DB_PORT`: Cổng kết nối MySQL, mặc định là `3306`. Nếu MySQL trên XAMPP hoặc Laragon sử dụng cổng `3307`, cần cập nhật lại thông số tương ứng.
- `DB_USER`: Tên tài khoản MySQL, mặc định là `root`.
- `DB_PASSWORD`: Mật khẩu tài khoản MySQL. Đối với XAMPP mặc định, có thể để trống nếu tài khoản root không thiết lập mật khẩu.
- `DB_NAME`: Tên cơ sở dữ liệu sử dụng trong dự án, mặc định là `unieat_db`.

**Nhóm 3 – JWT Authentication**

- `JWT_SECRET`: Khóa bí mật được sử dụng để ký và xác thực JSON Web Token.
- `JWT_EXPIRES_IN`: Thời gian hiệu lực của Token, mặc định là 7 ngày.

**Nhóm 4 – CORS**

- `CLIENT_URL`: Địa chỉ Frontend được phép gửi yêu cầu đến Backend, mặc định là `http://localhost:5173`.

**Nhóm 5 – Cloudinary**

Các biến môi trường Cloudinary được sử dụng để cấu hình dịch vụ lưu trữ và quản lý hình ảnh trực tuyến.

Trong trường hợp sử dụng Cloudinary thực tế, cần đăng ký tài khoản và thay thế các thông số mẫu bằng thông tin được cung cấp trong Dashboard của Cloudinary.

**Nhóm 6 – Cổng thanh toán**

Các biến môi trường VNPAY và MoMo được sử dụng để tích hợp chức năng thanh toán trực tuyến.

Khi triển khai môi trường thử nghiệm (Sandbox), cần đăng ký thông tin tài khoản tương ứng và cập nhật các thông số xác thực theo hướng dẫn của nhà cung cấp.

Lưu ý: Các giá trị đang hiển thị trong tài liệu chỉ mang tính chất minh họa. Cần thay thế bằng thông tin hợp lệ trước khi sử dụng các dịch vụ tương ứng. Không sử dụng khóa bí mật mặc định trong môi trường thực tế.

---

### 1.2. Cấu hình Database MySQL: File `backend/database.sql`

Dự án UniEat Campus sử dụng MySQL để lưu trữ và quản lý dữ liệu nghiệp vụ, bao gồm thông tin người dùng, thực đơn, đơn hàng, bàn ăn, thanh toán và các chương trình khuyến mãi.

Quá trình khởi tạo cơ sở dữ liệu được thực hiện theo các bước sau:

**Bước 1: Khởi động dịch vụ MySQL**

Khởi động MySQL trên máy tính cá nhân thông qua một trong các công cụ quản lý cơ sở dữ liệu sau:

- XAMPP Control Panel.
- Laragon.
- MySQL Server.

Đảm bảo dịch vụ MySQL đang hoạt động trước khi thực hiện các bước tiếp theo.

**Bước 2: Truy cập công cụ quản lý cơ sở dữ liệu**

Mở trình duyệt và truy cập địa chỉ:

```text
http://localhost/phpmyadmin
```

Ngoài ra, có thể sử dụng các công cụ quản lý cơ sở dữ liệu khác như Navicat, DBeaver, MySQL Workbench hoặc HeidiSQL.

**Bước 3: Tạo cơ sở dữ liệu**

Thực thi câu lệnh SQL sau để khởi tạo cơ sở dữ liệu:

```sql
CREATE DATABASE `unieat_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Cơ sở dữ liệu được tạo với bộ mã hóa `utf8mb4`, hỗ trợ lưu trữ dữ liệu tiếng Việt và các ký tự Unicode.

**Bước 4: Import dữ liệu**

Sau khi tạo cơ sở dữ liệu thành công:

1. Chọn database `unieat_db` trong phpMyAdmin.
2. Truy cập tab **Import**.
3. Chọn tệp `backend/database.sql` từ thư mục dự án.
4. Nhấn **Go** để bắt đầu quá trình nhập dữ liệu.
5. Chờ hệ thống hoàn tất quá trình thực thi các câu lệnh SQL.

Ngoài phương pháp sử dụng phpMyAdmin, có thể thực hiện import thông qua Terminal hoặc CMD bằng câu lệnh:

```bash
mysql -u root -p unieat_db < backend/database.sql
```

Nếu tài khoản MySQL không sử dụng mật khẩu, có thể thực hiện theo cấu hình xác thực tương ứng trên máy tính.

**Bước 5: Kiểm tra kết quả**

Sau khi import thành công, kiểm tra danh sách các bảng dữ liệu trong database `unieat_db`.

Theo cấu trúc được thiết kế, hệ thống dự kiến có 14 bảng, bao gồm:

`users`, `products`, `orders`, `order_details`, `dining_tables`, `payments`, `vouchers` và các bảng nghiệp vụ liên quan.

Lưu ý: Số lượng bảng thực tế phụ thuộc vào nội dung của tệp `database.sql`.

---

### 1.3. Cấu hình Frontend: File `frontend/.env`

Tệp `frontend/.env` chứa các biến môi trường được sử dụng trong ứng dụng ReactJS, phục vụ quá trình kết nối API, giao tiếp Socket.IO và thiết lập thông tin ứng dụng.

Mở tệp `frontend/.env` và thiết lập nội dung như sau:

```env
# ĐỊA CHỈ API BACKEND
VITE_API_URL=http://localhost:5000/api

# ĐỊA CHỈ SOCKET.IO SERVER
VITE_SOCKET_URL=http://localhost:5000

# TÊN ỨNG DỤNG
VITE_APP_NAME="UniEat - Căng Tin Đại Học"
```

**Giải thích các thông số cấu hình:**

- `VITE_API_URL`: Địa chỉ máy chủ API Backend mà ứng dụng Frontend sử dụng để gửi và nhận dữ liệu.
- `VITE_SOCKET_URL`: Địa chỉ máy chủ Socket.IO phục vụ giao tiếp thời gian thực.
- `VITE_APP_NAME`: Tên hiển thị của ứng dụng UniEat Campus.

**Cấu hình Proxy và xử lý CORS**

Trong tệp `frontend/vite.config.ts`, dự án có thể sử dụng cơ chế Proxy của Vite để chuyển tiếp các yêu cầu API từ Frontend sang Backend.

Cấu hình này giúp đơn giản hóa quá trình kết nối giữa hai ứng dụng trong môi trường phát triển.

Cần lưu ý rằng Proxy chỉ xử lý các yêu cầu được cấu hình chuyển tiếp. Nếu Frontend kết nối trực tiếp đến địa chỉ Backend hoặc Socket.IO, máy chủ Backend vẫn cần được cấu hình CORS phù hợp.

---

### 1.4. Cấu hình Socket.IO Real-time: File `backend/src/config/socket.config.ts` và thư mục `backend/src/socket/`

Socket.IO được sử dụng để triển khai chức năng giao tiếp thời gian thực giữa các thành phần trong hệ thống UniEat Campus.

Thành phần này hỗ trợ trao đổi dữ liệu tức thời giữa sinh viên, nhân viên bếp và quản trị viên mà không cần tải lại trang.

**Tệp `backend/src/config/socket.config.ts`**

Đây là tệp cấu hình các thông số kết nối Socket.IO, bao gồm:

- Cấu hình CORS thông qua biến môi trường `CLIENT_URL`.
- Đường dẫn kết nối Socket.IO, mặc định là `/socket.io`.
- Phương thức truyền tải dữ liệu: `websocket` và `polling`.
- Thời gian chờ phản hồi Ping (Ping Timeout): 60 giây.
- Danh sách các sự kiện được sử dụng trong hệ thống, chẳng hạn như `order:new`, `order:status_updated`, `table:occupied` và `notification:received`.

**Thư mục `backend/src/socket/`**

Thư mục này chứa các module chuyên trách xử lý sự kiện thời gian thực:

- `index.ts`: Khởi tạo Socket.IO Server, quản lý kết nối và phân quyền truy cập theo vai trò người dùng, bao gồm Sinh viên, Nhân viên bếp và Quản trị viên.
- `order.socket.ts`: Xử lý thông báo đơn hàng mới cho bộ phận bếp và cập nhật trạng thái chế biến đơn hàng cho sinh viên.
- `notification.socket.ts`: Xử lý các thông báo liên quan đến nạp ví, chương trình khuyến mãi, voucher và Flash Sale.
- `table.socket.ts`: Cập nhật trạng thái bàn ăn theo thời gian thực khi sinh viên thực hiện thao tác quét mã QR.

Các module Socket.IO cần được khởi tạo và tích hợp với máy chủ Express để đảm bảo khả năng giao tiếp giữa Backend và Frontend.

---

### 1.5. Cấu hình Redis Cache và Session: File `backend/src/config/redis.config.ts` và `backend/src/services/redis.service.ts`

Redis là hệ thống lưu trữ dữ liệu dạng key-value trong bộ nhớ, được sử dụng nhằm tối ưu hiệu suất truy xuất dữ liệu và giảm tải cho cơ sở dữ liệu chính.

Trong dự án UniEat Campus, Redis được thiết kế là thành phần tùy chọn. Khi chưa cài đặt Redis, hệ thống có thể sử dụng cơ chế lưu trữ Cache trong bộ nhớ của ứng dụng (In-Memory Cache), nếu cơ chế dự phòng đã được triển khai và kích hoạt đúng cách.

**Cấu hình Redis mặc định**

- `REDIS_ENABLED=false`: Tắt kết nối Redis và sử dụng cơ chế Cache dự phòng.
- Khi Redis chưa được cài đặt, hệ thống tiếp tục hoạt động thông qua In-Memory Cache, tùy thuộc vào cấu hình triển khai thực tế.

**Các bước kích hoạt Redis**

Trong trường hợp cần sử dụng Redis trên máy tính cá nhân, thực hiện các bước sau:

**Bước 1: Cài đặt và khởi chạy Redis**

Có thể sử dụng Docker để khởi tạo Redis Container bằng câu lệnh:

```bash
docker run -d --name redis-unieat -p 6379:6379 redis:alpine
```

**Bước 2: Cập nhật biến môi trường**

Mở tệp `backend/.env` và thay đổi:

```env
REDIS_ENABLED=true
```

**Bước 3: Thiết lập thông số Cache**

Hệ thống được thiết kế với các khoảng thời gian lưu trữ Cache (TTL) tham khảo như sau:

- Menu: 30 phút.
- Sản phẩm bán chạy (Bestsellers): 10 phút.
- Flash Sale: 5 phút.
- Session: 7 ngày.

Các tiền tố Key được sử dụng để phân loại dữ liệu:

- `unieat:cache:`
- `unieat:ratelimit:`
- `unieat:session:`

**Bước 4: Sử dụng Redis Service**

Tệp `backend/src/services/redis.service.ts` cung cấp các phương thức hỗ trợ thao tác với Redis:

- `get()`: Lấy dữ liệu theo Key.
- `set()`: Lưu dữ liệu vào Cache.
- `del()`: Xóa dữ liệu theo Key.
- `exists()`: Kiểm tra sự tồn tại của Key.
- `remember()`: Triển khai cơ chế Cache-Aside, cho phép kiểm tra Cache trước khi truy xuất dữ liệu từ nguồn lưu trữ chính.

Việc sử dụng Redis giúp cải thiện tốc độ phản hồi của hệ thống, đặc biệt đối với các chức năng có tần suất truy cập cao.

---

## PHẦN 2: CÁC BƯỚC KHỞI ĐỘNG DỰ ÁN TRÊN MÁY TÍNH CÁ NHÂN

Sau khi hoàn tất quá trình cấu hình môi trường và khởi tạo cơ sở dữ liệu, tiến hành cài đặt các thư viện cần thiết và khởi chạy hai thành phần Frontend, Backend.

Trước khi thực hiện, cần đảm bảo máy tính đã cài đặt:

- Node.js và npm.
- MySQL Server hoặc XAMPP/Laragon.
- Trình quản lý cơ sở dữ liệu (phpMyAdmin hoặc công cụ tương đương).
- Visual Studio Code hoặc một trình soạn thảo mã nguồn tương đương.

Dự án sử dụng hai máy chủ độc lập, do đó cần mở hai cửa sổ Terminal hoặc CMD để khởi chạy đồng thời.

### Bước 1: Khởi động Backend (Terminal 1)

**1. Di chuyển vào thư mục Backend**

Mở Terminal tại thư mục gốc của dự án và thực hiện:

```bash
cd backend
```

**2. Cài đặt các thư viện phụ thuộc**

Thực hiện lệnh:

```bash
npm install
```

Lệnh này sẽ đọc danh sách Dependencies trong tệp `package.json` và tự động cài đặt các thư viện cần thiết cho Backend.

**3. Khởi chạy máy chủ Backend**

Sau khi quá trình cài đặt hoàn tất, thực hiện:

```bash
npm run dev
```

Lệnh này khởi chạy máy chủ ở chế độ Development. Nếu dự án đã tích hợp công cụ theo dõi thay đổi mã nguồn, máy chủ sẽ tự động khởi động lại khi phát hiện các thay đổi phù hợp.

**4. Kiểm tra kết quả khởi chạy**

Nếu cấu hình chính xác, Terminal sẽ hiển thị thông tin tương tự:

```text
UniEat Campus Backend Server đang chạy!

URL API: http://localhost:5000/api
Socket.IO Real-time: http://localhost:5000
Frontend Allowed: http://localhost:5173
```

Khi đó, máy chủ Backend đã sẵn sàng tiếp nhận các yêu cầu từ ứng dụng Frontend.

---

### Bước 2: Khởi động Frontend (Terminal 2)

Giữ nguyên cửa sổ Terminal đang chạy Backend và mở thêm một cửa sổ Terminal mới.

**1. Di chuyển vào thư mục Frontend**

Tại thư mục gốc của dự án, thực hiện:

```bash
cd frontend
```

**2. Cài đặt các thư viện phụ thuộc**

Thực hiện lệnh:

```bash
npm install
```

Quá trình này sẽ cài đặt các thư viện phục vụ giao diện người dùng, bao gồm ReactJS, Vite và các thành phần liên quan được khai báo trong `package.json`.

**3. Khởi chạy ứng dụng Frontend**

Sau khi cài đặt hoàn tất, thực hiện:

```bash
npm run dev
```

**4. Kiểm tra kết quả khởi chạy**

Nếu ứng dụng được cấu hình chính xác, Vite sẽ hiển thị thông tin tương tự:

```text
VITE v6.2.3 ready in 250 ms

Local:   http://localhost:5173/
Network: use --host to expose
```

**5. Truy cập hệ thống**

Mở trình duyệt và truy cập địa chỉ:

```text
http://localhost:5173
```

Giao diện hệ thống UniEat Campus sẽ được hiển thị nếu Frontend, Backend và cơ sở dữ liệu đã được cấu hình và khởi chạy thành công.

---

### 3. Tài khoản Quản trị viên (Admin)

Sau khi khởi tạo cơ sở dữ liệu và import dữ liệu mẫu thành công, hệ thống cung cấp tài khoản Quản trị viên để phục vụ quá trình đăng nhập và kiểm thử các chức năng quản lý.

**Thông tin tài khoản:**

- Email: `admin@university.edu.vn`
- Vai trò: `ADMIN`

**Các chức năng quản lý:**

- Thống kê và theo dõi doanh thu.
- Quản lý thực đơn và sản phẩm.
- Quản lý bàn ăn và mã QR.
- Quản lý voucher và chương trình khuyến mãi.

Lưu ý: Tài khoản trên chỉ sử dụng được khi đã tồn tại trong dữ liệu được import từ `backend/database.sql`. Mật khẩu đăng nhập cần được kiểm tra trong dữ liệu mẫu hoặc tài liệu bàn giao của dự án.

---

## KẾT LUẬN

Sau khi hoàn tất các bước cài đặt và cấu hình, hệ thống UniEat Campus có thể được triển khai trên môi trường máy tính cá nhân để phục vụ quá trình phát triển, kiểm thử và đánh giá các chức năng.

Các thành phần chính của hệ thống được khởi chạy độc lập nhưng có khả năng kết nối và trao đổi dữ liệu thông qua API, Socket.IO và cơ sở dữ liệu MySQL.

Việc tuân thủ các bước hướng dẫn trên giúp đảm bảo môi trường phát triển được thiết lập đồng nhất, hạn chế các lỗi phát sinh trong quá trình cài đặt và vận hành hệ thống.
