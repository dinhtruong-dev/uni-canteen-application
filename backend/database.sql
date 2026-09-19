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
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA)
-- Mật khẩu mặc định của tài khoản là: 123456 (đã hash bằng Bcrypt)
-- ====================================================================

INSERT INTO `users` (`id`, `student_id`, `name`, `email`, `password_hash`, `phone`, `role`, `faculty`, `wallet_balance`) VALUES
('user-stu-1', 'SV20220192', 'Đặng Hoàng Minh', 'minh.dh22@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0987654321', 'STUDENT', 'Khoa Công Nghệ Thông Tin', 150000.00),
('user-stu-2', 'SV20230514', 'Trần Thị Mai Phương', 'phuong.ttm23@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0977888999', 'STUDENT', 'Khoa Kinh Tế Quốc Tế', 85000.00),
('user-staff-1', NULL, 'Cô Nguyễn Thị Lan (Bếp trưởng)', 'lan.canteen@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0912345678', 'STAFF', 'Tổ Chế Biến Căng Tin A2', 0.00),
('user-admin-1', NULL, 'Thầy Nguyễn Tuấn Anh', 'admin.canteen@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0909999888', 'ADMIN', 'Phòng Quản Trị Căng Tin', 0.00);

INSERT INTO `categories` (`id`, `name`, `icon`, `image`, `description`, `display_order`, `is_active`) VALUES
('cat-1', 'Cơm Sinh Viên', 'Utensils', 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', 'Cơm tấm, cơm gà xối mỡ, sườn bì chả', 1, TRUE),
('cat-2', 'Bún & Phở Nóng', 'Soup', 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', 'Nước dùng đậm đà thơm ngậy xương hầm', 2, TRUE),
('cat-3', 'Đồ Uống Giải Khát', 'Coffee', 'https://cdn-icons-png.flaticon.com/512/3081/3081996.png', 'Trà đào, trà sữa, cà phê pha máy', 3, TRUE),
('cat-4', 'Ăn Vặt & Bánh Mì', 'Sandwich', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', 'Bánh mì pate trứng nướng, khoai tây chiên', 4, TRUE);

INSERT INTO `dining_tables` (`id`, `table_number`, `canteen_id`, `canteen_name`, `qr_code`, `capacity`, `area`, `status`) VALUES
('tbl-1', 'Bàn 01', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_01', 4, 'Tầng 1 - Sân trước', 'AVAILABLE'),
('tbl-2', 'Bàn 02', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_02', 4, 'Tầng 1 - Sân trước', 'OCCUPIED'),
('tbl-3', 'Bàn 03', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_03', 6, 'Tầng 2 - Phòng Lạnh', 'AVAILABLE'),
('tbl-4', 'Bàn 04', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_04', 2, 'Góc Sân Vườn', 'AVAILABLE');

INSERT INTO `vouchers` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `is_active`) VALUES
('vouch-1', 'KHAIGIANG20', 'Giảm 20% Chào Kỳ Mới', 'Giảm 20% tối đa 15K đơn từ 35.000đ', 'PERCENTAGE', 20.00, 35000.00, 15000.00, 500, 124, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE),
('vouch-2', 'FREESHIPKTX', 'Miễn Phí Giao KTX', 'Giảm 10.000đ phí giao hàng tới KTX A, B', 'FIXED', 10000.00, 30000.00, NULL, 1000, 310, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE);
