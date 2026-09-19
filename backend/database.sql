-- ====================================================================
-- HỆ THỐNG QUẢN LÝ VÀ ĐẶT MÓN CĂNG TIN ĐẠI HỌC (UNIEAT CAMPUS)
-- CƠ SỞ DỮ LIỆU: MySQL 8.0+
-- Thiết kế theo mô hình chuẩn hóa quan hệ (3NF) với Khóa Ngoại (Foreign Keys)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `unieat_campus_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `unieat_campus_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `vouchers`;
DROP TABLE IF EXISTS `flash_sales`;
DROP TABLE IF EXISTS `banners`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `carts`;
DROP TABLE IF EXISTS `product_option_items`;
DROP TABLE IF EXISTS `product_options`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `dining_tables`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `delivery_addresses`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. BẢNG NGƯỜI DÙNG (Users)
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(30) NULL COMMENT 'Mã số sinh viên (nếu là Sinh viên)',
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu mã hóa bằng Bcrypt',
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `faculty` VARCHAR(100) NULL COMMENT 'Khoa / Viện',
  `department` VARCHAR(100) NULL COMMENT 'Bộ phận làm việc (nếu là Nhân viên/Admin)',
  `wallet_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số dư ví sinh viên',
  `avatar` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG ĐỊA CHỈ NHẬN HÀNG KTX (Delivery Addresses)
CREATE TABLE `delivery_addresses` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `recipient_name` VARCHAR(100) NOT NULL,
  `recipient_phone` VARCHAR(20) NOT NULL,
  `dorm_block` VARCHAR(100) NOT NULL COMMENT 'Tòa nhà: KTX A1, KTX B2, v.v.',
  `room_number` VARCHAR(50) NOT NULL COMMENT 'Số phòng: P.402, v.v.',
  `full_address` VARCHAR(255) NOT NULL,
  `notes` VARCHAR(255) NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_addr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG MỤC YÊU THÍCH (Favorites)
CREATE TABLE `favorites` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `target_type` ENUM('PRODUCT', 'ORDER') NOT NULL DEFAULT 'PRODUCT',
  `target_id` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG BÀN ĂN & MÃ QR (Dining Tables)
CREATE TABLE `dining_tables` (
  `id` VARCHAR(50) NOT NULL,
  `table_number` VARCHAR(30) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL DEFAULT 'cant-a',
  `canteen_name` VARCHAR(100) NOT NULL DEFAULT 'Căng tin A2',
  `qr_code` VARCHAR(500) NOT NULL COMMENT 'Dữ liệu hoặc URL định danh mã QR',
  `capacity` INT NOT NULL DEFAULT 4,
  `area` VARCHAR(100) NOT NULL DEFAULT 'Khu vực chính',
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  `current_order_id` VARCHAR(50) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tables_canteen` (`canteen_id`),
  INDEX `idx_tables_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG DANH MỤC THỰC ĐƠN (Categories)
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `description` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG MÓN ĂN CHÍNH (Products)
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL DEFAULT 'cant-a',
  `canteen_name` VARCHAR(100) NOT NULL DEFAULT 'Căng tin A2',
  `image` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn ảnh trên Cloudinary CDN',
  `description` TEXT NULL,
  `rating` DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  `review_count` INT NOT NULL DEFAULT 0,
  `preparation_time` INT NOT NULL DEFAULT 10 COMMENT 'Thời gian chuẩn bị (phút)',
  `calories` INT NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_bestseller` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_new` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_vegetarian` BOOLEAN NOT NULL DEFAULT FALSE,
  `sold_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  INDEX `idx_products_cat` (`category_id`),
  INDEX `idx_products_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG TÙY CHỌN MÓN ĂN (Product Options: Size, Topping, Lượng đá/đường)
CREATE TABLE `product_options` (
  `id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'VD: Chọn Size, Thêm Topping, Lượng Đường',
  `type` ENUM('SIZE', 'TOPPING', 'SUGAR_LEVEL', 'ICE_LEVEL', 'CUSTOM') NOT NULL,
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `max_select` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_opt_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG CHI TIẾT MỤC TÙY CHỌN (Product Option Items)
CREATE TABLE `product_option_items` (
  `id` VARCHAR(50) NOT NULL,
  `option_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'VD: Size L (+10K), Trứng ốp la (+5K)',
  `extra_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_item_opt` FOREIGN KEY (`option_id`) REFERENCES `product_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG GIỎ HÀNG (Carts)
CREATE TABLE `carts` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `canteen_id` VARCHAR(50) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG MỤC TRONG GIỎ (Cart Items)
CREATE TABLE `cart_items` (
  `id` VARCHAR(50) NOT NULL,
  `cart_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `selected_options_json` JSON NULL COMMENT 'Lưu danh sách snapshot options đã chọn',
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BẢNG ĐƠN HÀNG (Orders)
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_code` VARCHAR(20) NOT NULL UNIQUE,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL,
  `canteen_name` VARCHAR(100) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `final_amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `order_type` ENUM('DINE_IN', 'TAKEAWAY', 'DELIVERY') NOT NULL,
  `table_id` VARCHAR(50) NULL,
  `table_number` VARCHAR(30) NULL,
  `pickup_slot` VARCHAR(50) NULL,
  `delivery_address_id` VARCHAR(50) NULL,
  `delivery_address_text` VARCHAR(255) NULL,
  `payment_method` ENUM('CAMPUS_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'CASH') NOT NULL,
  `is_paid` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_code` (`order_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BẢNG CHI TIẾT ĐƠN HÀNG (Order Details)
CREATE TABLE `order_details` (
  `id` VARCHAR(50) NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `product_image` VARCHAR(500) NOT NULL,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `selected_options_json` JSON NULL,
  `item_subtotal` DECIMAL(12, 2) NOT NULL,
  `notes` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_od_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BẢNG GIAO DỊCH THANH TOÁN (Payments: VNPay, MoMo, Ví sinh viên)
CREATE TABLE `payments` (
  `id` VARCHAR(50) NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `method` ENUM('CAMPUS_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY', 'BANK_TRANSFER', 'CASH') NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transaction_code` VARCHAR(100) NOT NULL UNIQUE,
  `gateway_response_json` JSON NULL COMMENT 'Lưu phản hồi gốc từ VNPay/MoMo Webhook',
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. BẢNG BANNER QUẢNG CÁO (Banners)
CREATE TABLE `banners` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(255) NULL,
  `target_type` ENUM('PRODUCT', 'CATEGORY', 'EXTERNAL') NULL,
  `target_id` VARCHAR(50) NULL,
  `display_order` INT NOT NULL DEFAULT 1,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `start_date` TIMESTAMP NULL,
  `end_date` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. BẢNG FLASH SALE GIỜ VÀNG (Flash Sales)
CREATE TABLE `flash_sales` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `original_price` DECIMAL(10, 2) NOT NULL,
  `sale_price` DECIMAL(10, 2) NOT NULL,
  `discount_percent` INT NOT NULL,
  `total_slots` INT NOT NULL,
  `sold_slots` INT NOT NULL DEFAULT 0,
  `start_time` TIMESTAMP NOT NULL,
  `end_time` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_fs_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. BẢNG MÃ GIẢM GIÁ / VOUCHER (Vouchers)
CREATE TABLE `vouchers` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `discount_type` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `min_order_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `max_discount` DECIMAL(12, 2) NULL,
  `usage_limit` INT NOT NULL DEFAULT 1000,
  `used_count` INT NOT NULL DEFAULT 0,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. BẢNG ĐÁNH GIÁ (Reviews)
CREATE TABLE `reviews` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `target_type` ENUM('PRODUCT', 'CANTEEN') NOT NULL DEFAULT 'PRODUCT',
  `target_id` VARCHAR(50) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5,
  `comment` TEXT NOT NULL,
  `verified_purchase` BOOLEAN NOT NULL DEFAULT TRUE,
  `helpful_count` INT NOT NULL DEFAULT 0,
  `images_json` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. BẢNG THÔNG BÁO (Notifications)
CREATE TABLE `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL COMMENT 'ID của sinh viên hoặc ALL nếu gửi toàn trường',
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ORDER_STATUS', 'SYSTEM', 'PROMOTION', 'WALLET') NOT NULL DEFAULT 'SYSTEM',
  `reference_id` VARCHAR(50) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- DỮ LIỆU KHỞI TẠO MẪU ĐẦY ĐỦ (COMPREHENSIVE SEED DATA)
-- Mật khẩu mặc định của tài khoản là: 123456 (đã hash bằng Bcrypt)
-- ====================================================================

-- 1. TÀI KHOẢN NGƯỜI DÙNG (Users)
INSERT INTO `users` (`id`, `student_id`, `name`, `email`, `password_hash`, `phone`, `role`, `faculty`, `wallet_balance`) VALUES
('user-stu-1', 'SV20220192', 'Đặng Hoàng Minh', 'minh.dh22@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0987654321', 'STUDENT', 'Khoa Công Nghệ Thông Tin', 150000.00),
('user-stu-2', 'SV20230514', 'Trần Thị Mai Phương', 'phuong.ttm23@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0977888999', 'STUDENT', 'Khoa Kinh Tế Quốc Tế', 85000.00),
('user-staff-1', NULL, 'Cô Nguyễn Thị Lan (Bếp trưởng)', 'lan.canteen@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0912345678', 'STAFF', 'Tổ Chế Biến Căng Tin A2', 0.00),
('user-admin-1', NULL, 'Thầy Nguyễn Tuấn Anh', 'admin.canteen@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0909999888', 'ADMIN', 'Phòng Quản Trị Căng Tin', 0.00);

-- 2. ĐỊA CHỈ GIAO HÀNG (Delivery Addresses)
INSERT INTO `delivery_addresses` (`id`, `user_id`, `label`, `building`, `room`, `note`, `is_default`) VALUES
('addr-1', 'user-stu-1', 'Phòng KTX', 'KTX Khu B (Nhà B5)', 'Phòng 402', 'Bấm chuông hoặc gọi trước khi lên', TRUE),
('addr-2', 'user-stu-1', 'Giảng đường', 'Tòa Nhà H1 - Giảng đường', 'Phòng 204', 'Giao vào giờ ra chơi', FALSE);

-- 3. DANH MỤC MÓN ĂN (Categories)
INSERT INTO `categories` (`id`, `name`, `icon`, `image`, `description`, `display_order`, `is_active`) VALUES
('cat-1', 'Cơm Sinh Viên', 'Utensils', 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', 'Cơm tấm, cơm gà xối mắm tỏi, sườn bì chả nướng mật ong', 1, TRUE),
('cat-2', 'Bún & Phở Nóng', 'Soup', 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', 'Nước dùng đậm đà thơm ngậy xương hầm 12 tiếng', 2, TRUE),
('cat-3', 'Đồ Uống Giải Khát', 'Coffee', 'https://cdn-icons-png.flaticon.com/512/3081/3081996.png', 'Trà đào cam sả, trà sữa trân châu, cà phê muối', 3, TRUE),
('cat-4', 'Ăn Vặt & Bánh Mì', 'Sandwich', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', 'Bánh mì pate trứng xá xíu, khoai lắc phô mai', 4, TRUE),
('cat-5', 'Mì & Fast Food', 'Flame', 'https://cdn-icons-png.flaticon.com/512/3081/3081944.png', 'Mì Ý sốt bò bằm phô mai, hamburger gà giòn', 5, TRUE);

-- 4. BÀN ĂN & MÃ QR (Dining Tables)
INSERT INTO `dining_tables` (`id`, `table_number`, `canteen_id`, `canteen_name`, `qr_code`, `capacity`, `area`, `status`) VALUES
('tbl-1', 'Bàn 01', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_01', 4, 'Tầng 1 - Sân trước', 'AVAILABLE'),
('tbl-2', 'Bàn 02', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_02', 4, 'Tầng 1 - Sân trước', 'OCCUPIED'),
('tbl-3', 'Bàn 03', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_03', 6, 'Tầng 2 - Phòng Lạnh', 'AVAILABLE'),
('tbl-4', 'Bàn 04', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_04', 2, 'Góc Sân Vườn', 'AVAILABLE'),
('tbl-5', 'Bàn 05', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_05', 4, 'Tầng 1 - Gần Quầy Gọi Món', 'AVAILABLE'),
('tbl-6', 'Bàn 06', 'cant-b', 'Căng tin B (KTX)', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_B_TBL_06', 8, 'Khu Bàn Nhóm Sinh Viên', 'AVAILABLE');

-- 5. DANH SÁCH MÓN ĂN (Products)
INSERT INTO `products` (`id`, `name`, `price`, `original_price`, `category_id`, `canteen_id`, `canteen_name`, `image`, `description`, `rating`, `review_count`, `preparation_time`, `calories`, `is_available`, `is_bestseller`, `is_new`, `is_vegetarian`, `sold_count`) VALUES
('prod-1', 'Cơm Gà Chiên Mắm Tỏi Giòn', 35000.00, 45000.00, 'cat-1', 'cant-a', 'Căng tin A2', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', 'Đùi gà góc tư chiên giòn rụm xốt mắm tỏi ớt đặc trưng, ăn kèm dưa chuột và canh rau dền nóng hổi.', 4.9, 184, 10, 620, TRUE, TRUE, FALSE, FALSE, 380),
('prod-2', 'Cơm Tấm Sườn Bì Chả Đặc Biệt', 38000.00, 45000.00, 'cat-1', 'cant-a', 'Căng tin A2', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600', 'Sườn cốt lết nướng than hoa mật ong, chả trứng hấp béo bùi cùng bì heo dai giòn chuẩn vị Sài Gòn.', 4.8, 210, 12, 680, TRUE, TRUE, FALSE, FALSE, 450),
('prod-3', 'Phở Bò Tái Lăn Hà Nội', 35000.00, 42000.00, 'cat-2', 'cant-b', 'Căng tin B (KTX)', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600', 'Nước dùng hầm xương bò 12 tiếng thơm nức mũi hương gừng quế, thịt bò xào lăn mềm ngọt đậm đà.', 4.9, 312, 8, 520, TRUE, TRUE, FALSE, FALSE, 520),
('prod-4', 'Bánh Mì Kẹp Thịt Nướng Xá Xíu', 20000.00, 25000.00, 'cat-4', 'cant-a', 'Căng tin A2', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', 'Vỏ giòn rụm, nhân thịt xá xíu đậm vị cùng pate béo ngậy và sốt ớt cay nhẹ kích thích vị giác.', 4.7, 140, 5, 410, TRUE, FALSE, TRUE, FALSE, 310),
('prod-5', 'Trà Đào Cam Sả Khổng Lồ 700ml', 20000.00, 25000.00, 'cat-3', 'cant-c', 'Căng tin C (Thư Viện)', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600', 'Thanh mát sảng khoái sau những giờ học căng thẳng, miếng đào giòn ngọt kèm sả cam tươi tự nhiên.', 4.9, 420, 5, 180, TRUE, TRUE, FALSE, TRUE, 780),
('prod-6', 'Trà Sữa Trân Châu Đường Đen', 25000.00, 32000.00, 'cat-3', 'cant-c', 'Căng tin C (Thư Viện)', 'https://images.unsplash.com/photo-1558857563-b37cf5a31a54?auto=format&fit=crop&q=80&w=600', 'Trà sữa đậm vị hồng trà Phúc Long, trân châu thủ công nấu đường đen dẻo thơm nức mũi.', 4.8, 290, 5, 340, TRUE, TRUE, FALSE, TRUE, 640),
('prod-7', 'Bún Chả Hà Nội Nướng Than', 35000.00, 40000.00, 'cat-2', 'cant-a', 'Căng tin A2', 'https://images.unsplash.com/photo-1503764654157-729106a23422?auto=format&fit=crop&q=80&w=600', 'Chả miếng nướng vàng ươm thơm mùi than củi quyện nước chấm chua ngọt tỏi ớt đưa cơm.', 4.8, 175, 10, 550, TRUE, FALSE, FALSE, FALSE, 290),
('prod-8', 'Khoai Tây Chiên Lắc Phô Mai', 18000.00, 22000.00, 'cat-4', 'cant-c', 'Căng tin C (Thư Viện)', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600', 'Khoai tây cắt que nhập khẩu chiên giòn tan, phủ lớp bột phô mai béo ngậy thơm nức.', 4.7, 195, 7, 320, TRUE, FALSE, FALSE, TRUE, 410),
('prod-9', 'Mì Ý Sốt Bò Bằm Phô Mai', 35000.00, 42000.00, 'cat-5', 'cant-c', 'Căng tin C (Thư Viện)', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600', 'Sợi mì spaghetti dai ngon quyện sốt cà chua thịt bò bằm đậm đà và phô mai Mozzarella kéo sợi.', 4.8, 160, 12, 590, TRUE, FALSE, TRUE, FALSE, 210),
('prod-10', 'Cà Phê Muối Xứ Huế', 18000.00, 22000.00, 'cat-3', 'cant-c', 'Căng tin C (Thư Viện)', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600', 'Cà phê Robusta Đắk Lắk pha phin nguyên chất kết hợp lớp kem mặn béo ngậy đặc trưng.', 4.9, 340, 5, 160, TRUE, TRUE, FALSE, TRUE, 590),
('prod-11', 'Bún Bò Huế Chả Cua Thịt Bắp', 38000.00, 45000.00, 'cat-2', 'cant-b', 'Căng tin B (KTX)', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600', 'Sợi bún to, thịt bắp bò hoa giòn sần sật, viên chả cua xứ Huế thơm nức mùi mắm ruốc.', 4.8, 190, 10, 580, TRUE, FALSE, FALSE, FALSE, 280),
('prod-12', 'Cơm Rang Dưa Bò Giòn Rụm', 35000.00, 40000.00, 'cat-1', 'cant-a', 'Căng tin A2', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600', 'Hạt cơm đảo vàng ruộm xen lẫn cơm cháy giòn tan, thịt bò xào dưa chua ngấm gia vị cực ngon.', 4.8, 230, 10, 640, TRUE, TRUE, FALSE, FALSE, 370);

-- 6. TÙY CHỌN MÓN ĂN (Product Options)
INSERT INTO `product_options` (`id`, `product_id`, `name`, `type`, `is_required`, `max_select`) VALUES
('opt-1', 'prod-1', 'Chọn Kích Cỡ', 'SIZE', TRUE, 1),
('opt-2', 'prod-1', 'Thêm Topping Cơm Gà', 'TOPPING', FALSE, 3),
('opt-3', 'prod-5', 'Chọn Lượng Đường', 'SUGAR_LEVEL', TRUE, 1),
('opt-4', 'prod-5', 'Chọn Lượng Đá', 'ICE_LEVEL', TRUE, 1),
('opt-5', 'prod-6', 'Chọn Topping Trà Sữa', 'TOPPING', FALSE, 3),
('opt-6', 'prod-2', 'Thêm Topping Cơm Tấm', 'TOPPING', FALSE, 3);

-- 7. CHI TIẾT MỤC TÙY CHỌN (Product Option Items)
INSERT INTO `product_option_items` (`id`, `option_id`, `name`, `extra_price`, `is_default`) VALUES
('opt-item-1', 'opt-1', 'Suất Vừa (Chuẩn)', 0.00, TRUE),
('opt-item-2', 'opt-1', 'Suất Lớn (Thêm Cơm & Đùi Gà To)', 10000.00, FALSE),
('opt-item-3', 'opt-2', 'Trứng ốp la lòng đào', 5000.00, FALSE),
('opt-item-4', 'opt-2', 'Canh rong biển thịt bằm', 5000.00, FALSE),
('opt-item-5', 'opt-2', 'Kim chi cay Hàn Quốc', 4000.00, FALSE),
('opt-item-6', 'opt-3', '100% Đường (Chuẩn)', 0.00, TRUE),
('opt-item-7', 'opt-3', '70% Đường (Vừa phải)', 0.00, FALSE),
('opt-item-8', 'opt-3', '50% Đường (Ít ngọt)', 0.00, FALSE),
('opt-item-9', 'opt-3', 'Không đường', 0.00, FALSE),
('opt-item-10', 'opt-4', '100% Đá', 0.00, TRUE),
('opt-item-11', 'opt-4', '50% Đá', 0.00, FALSE),
('opt-item-12', 'opt-4', 'Không đá', 0.00, FALSE),
('opt-item-13', 'opt-5', 'Trân châu đen dẻo', 5000.00, TRUE),
('opt-item-14', 'opt-5', 'Pudding trứng béo bùi', 6000.00, FALSE),
('opt-item-15', 'opt-5', 'Thạch phô mai tươi', 7000.00, FALSE),
('opt-item-16', 'opt-6', 'Thêm trứng ốp la', 5000.00, FALSE),
('opt-item-17', 'opt-6', 'Thêm miếng chả trứng', 6000.00, FALSE),
('opt-item-18', 'opt-6', 'Thêm chén tóp mỡ mắm', 3000.00, FALSE);

-- 8. BANNER QUẢNG CÁO (Banners)
INSERT INTO `banners` (`id`, `title`, `subtitle`, `image_url`, `link_url`, `target_type`, `target_id`, `display_order`, `is_active`) VALUES
('ban-1', 'Combo Cơm Gà Chiên Mắm Tỏi', 'TẶNG NGAY 1 Trà Đào Sảng Khoái khi đặt combo trưa', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200', NULL, 'PRODUCT', 'prod-1', 1, TRUE),
('ban-2', 'Đồng Giá 19.000đ Bún & Phở Nóng', 'Giảm tới 45% khung giờ vàng 11h30 - 13h30 tại Căng tin B', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1200', NULL, 'CATEGORY', 'cat-2', 2, TRUE),
('ban-3', 'Giao Hàng 0 Đồng Tận Phòng KTX', 'Nhập mã FREESHIPKTX - Đội shipper sinh viên giao 15 phút', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=1200', NULL, 'CATEGORY', 'cat-1', 3, TRUE),
('ban-4', 'Bữa Tối Sinh Viên Chỉ 29.000đ', 'Cơm Tấm Sườn Bì + Canh + Trà Đá cho mùa thi', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=1200', NULL, 'PRODUCT', 'prod-2', 4, TRUE);

-- 9. FLASH SALE GIỜ VÀNG (Flash Sales)
INSERT INTO `flash_sales` (`id`, `title`, `description`, `product_id`, `original_price`, `sale_price`, `discount_percent`, `total_slots`, `sold_slots`, `start_time`, `end_time`, `is_active`) VALUES
('fs-1', 'Flash Sale Giờ Vàng Cơm Gà', 'Đùi gà chiên giòn rụm xốt mắm tỏi giờ nghỉ trưa', 'prod-1', 45000.00, 25000.00, 44, 100, 68, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, TRUE),
('fs-2', 'Trà Đào Hạ Nhiệt Buổi Chiều', 'Ly 700ml giải nhiệt thi cử sảng khoái', 'prod-5', 25000.00, 15000.00, 40, 80, 52, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 3 HOUR, TRUE),
('fs-3', 'Phở Bò Tái Lăn Ưu Đãi Đậm', 'Tô phở nóng hổi nước dùng hầm 12h thơm lừng', 'prod-3', 42000.00, 26000.00, 38, 60, 35, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, TRUE),
('fs-4', 'Trà Sữa Trân Châu Giờ Nghỉ', 'Trân châu đường đen dẻo quánh sữa tươi béo ngậy', 'prod-6', 32000.00, 19000.00, 41, 90, 61, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 4 HOUR, TRUE);

-- 10. MÃ GIẢM GIÁ (Vouchers)
INSERT INTO `vouchers` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `is_active`) VALUES
('vouch-1', 'KHAIGIANG20', 'Giảm 20% Chào Kỳ Mới', 'Giảm 20% tối đa 15K cho đơn từ 35.000đ', 'PERCENTAGE', 20.00, 35000.00, 15000.00, 500, 124, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE),
('vouch-2', 'FREESHIPKTX', 'Miễn Phí Giao KTX', 'Giảm 10.000đ phí giao hàng tới KTX Khu A, B', 'FIXED', 10000.00, 30000.00, NULL, 1000, 310, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE),
('vouch-3', 'COMBO29K', 'Ưu Đãi Bữa Tối 29K', 'Giảm trực tiếp 9.000đ khi đặt combo cơm tấm buổi tối', 'FIXED', 9000.00, 38000.00, 9000.00, 300, 89, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 15 DAY, TRUE),
('vouch-4', 'UNIEAT50', 'Giảm 50% Món Thứ Hai', 'Giảm 50% tối đa 20.000đ cho đơn từ 60.000đ', 'PERCENTAGE', 50.00, 6000.00, 20000.00, 200, 45, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 20 DAY, TRUE);

-- 11. ĐÁNH GIÁ MÓN ĂN (Reviews)
INSERT INTO `reviews` (`id`, `user_id`, `user_name`, `target_type`, `target_id`, `rating`, `comment`, `verified_purchase`, `helpful_count`, `created_at`) VALUES
('rev-1', 'user-stu-1', 'Đặng Hoàng Minh', 'PRODUCT', 'prod-1', 5, 'Đùi gà to giòn rụm xốt mắm tỏi thơm điếc mũi! Có kèm canh nóng và dưa chuột ăn rất vừa miệng, đúng chất cơm căng tin.', TRUE, 12, NOW() - INTERVAL 2 DAY),
('rev-2', 'user-stu-2', 'Trần Thị Mai Phương', 'PRODUCT', 'prod-5', 5, 'Trà đào ly to uống đã khát cực kỳ, nhiều miếng đào giòn ngọt thơm lừng mùi sả, trưa nào ôn bài cũng phải mua 1 ly.', TRUE, 8, NOW() - INTERVAL 1 DAY),
('rev-3', 'user-stu-1', 'Đặng Hoàng Minh', 'PRODUCT', 'prod-3', 5, 'Phở bò tái lăn nước dùng trong mà ngọt lịm từ xương, thịt bò mềm xào chín tới thơm mùi tiêu.', TRUE, 15, NOW() - INTERVAL 3 DAY);

-- 12. THÔNG BÁO HỆ THỐNG (Notifications)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `reference_id`, `is_read`, `created_at`) VALUES
('notif-1', 'user-stu-1', 'Đơn hàng #ORD-8291 đã hoàn thành!', 'Bếp đã chế biến xong suất Cơm Gà Chiên Mắm Tỏi. Mời bạn lại quầy lấy món.', 'ORDER_STATUS', 'ord-101', TRUE, NOW() - INTERVAL 1 HOUR),
('notif-2', 'user-stu-1', '⚡ Flash Sale 11h30 bắt đầu!', 'Giảm tới 45% toàn bộ Bún & Phở Nóng tại Căng tin B. Săn ngay kẻo hết suất!', 'PROMOTION', 'fs-1', FALSE, NOW() - INTERVAL 30 MINUTE),
('notif-3', 'user-stu-1', 'Nạp tiền ví Campus thành công', 'Bạn vừa nạp 150.000đ vào ví UniEat qua VNPay. Số dư hiện tại: 150.000đ.', 'WALLET', 'tx-101', TRUE, NOW() - INTERVAL 2 DAY);

