-- ====================================================================
-- HỆ THỐNG QUẢN LÝ VÀ ĐẶT MÓN CĂNG TIN ĐẠI HỌC (UNIEAT CAMPUS)
-- CƠ SỞ DỮ LIỆU: MySQL 8.0+ / MariaDB (Tương thích 100% với XAMPP phpMyAdmin)
-- Thiết kế theo mô hình chuẩn hóa quan hệ (3NF) với Khóa Ngoại (Foreign Keys)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `unieat_campus_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `unieat_campus_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_vouchers`;
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
DROP TABLE IF EXISTS `option_items`;
DROP TABLE IF EXISTS `option_groups`;
DROP TABLE IF EXISTS `product_option_items`;
DROP TABLE IF EXISTS `product_options`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `pickup_slots`;
DROP TABLE IF EXISTS `dining_tables`;
DROP TABLE IF EXISTS `canteens`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `delivery_addresses`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 1. BẢNG NGƯỜI DÙNG (Users - Model: User.ts)
-- ====================================================================
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `student_id` VARCHAR(30) NULL COMMENT 'Mã số sinh viên (nếu là Sinh viên)',
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu mã hóa bằng Bcrypt (mặc định: 123456)',
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `faculty` VARCHAR(100) NULL COMMENT 'Khoa / Viện đào tạo',
  `department` VARCHAR(100) NULL COMMENT 'Bộ phận làm việc (nếu là Nhân viên/Admin)',
  `wallet_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số dư ví sinh viên UniEat',
  `avatar` VARCHAR(500) NULL,
  `status` ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 2. BẢNG CƠ SỞ CĂN TIN (Canteens - Model: Canteen.ts)
-- ====================================================================
CREATE TABLE `canteens` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `display_name` VARCHAR(150) NULL,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `location` VARCHAR(255) NOT NULL,
  `distance` VARCHAR(50) DEFAULT '150m',
  `duration` VARCHAR(50) DEFAULT '10 phút',
  `opening_hours` VARCHAR(100) DEFAULT '06:30 - 21:00',
  `is_open` BOOLEAN NOT NULL DEFAULT TRUE,
  `rating` DECIMAL(2, 1) NOT NULL DEFAULT 5.0,
  `review_count` INT NOT NULL DEFAULT 0,
  `sold_count` VARCHAR(50) DEFAULT '1.2K+',
  `voucher` VARCHAR(100) DEFAULT '120.000đ',
  `freeship` VARCHAR(100) DEFAULT 'Freeship KTX',
  `image` VARCHAR(500) NOT NULL,
  `total_tables` INT NOT NULL DEFAULT 30,
  `phone` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. BẢNG ĐỊA CHỈ NHẬN HÀNG KTX (Delivery Addresses - Model: DeliveryAddress.ts)
-- ====================================================================
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

-- ====================================================================
-- 4. BẢNG MỤC YÊU THÍCH (Favorites - Model: Favorite.ts)
-- ====================================================================
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

-- ====================================================================
-- 5. BẢNG BÀN ĂN & MÃ QR (Dining Tables - Model: DiningTable.ts)
-- ====================================================================
CREATE TABLE `dining_tables` (
  `id` VARCHAR(50) NOT NULL,
  `table_number` VARCHAR(30) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL,
  `canteen_name` VARCHAR(100) NOT NULL,
  `qr_code` VARCHAR(500) NOT NULL COMMENT 'Dữ liệu hoặc URL định danh mã QR',
  `capacity` INT NOT NULL DEFAULT 4,
  `area` VARCHAR(100) NOT NULL DEFAULT 'Khu vực chính',
  `status` ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  `current_order_id` VARCHAR(50) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_table_canteen` FOREIGN KEY (`canteen_id`) REFERENCES `canteens` (`id`) ON UPDATE CASCADE,
  INDEX `idx_tables_canteen` (`canteen_id`),
  INDEX `idx_tables_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 6. BẢNG KHUNG GIỜ NHẬN MÓN (Pickup Slots - Model: PickupSlot.ts)
-- ====================================================================
CREATE TABLE `pickup_slots` (
  `id` VARCHAR(50) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL,
  `time_range` VARCHAR(50) NOT NULL COMMENT 'VD: 11:00 - 11:15, 11:15 - 11:30',
  `max_orders` INT NOT NULL DEFAULT 30 COMMENT 'Giới hạn công suất tối đa tránh quá tải bếp',
  `current_orders` INT NOT NULL DEFAULT 0,
  `status` ENUM('AVAILABLE', 'FULL', 'DISABLED') NOT NULL DEFAULT 'AVAILABLE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_slot_canteen` FOREIGN KEY (`canteen_id`) REFERENCES `canteens` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 7. BẢNG DANH MỤC MÓN ĂN (Categories - Model: Category.ts)
-- ====================================================================
CREATE TABLE `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) NOT NULL,
  `description` TEXT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 8. BẢNG MÓN ĂN (Products / Foods - Model: Product.ts)
-- ====================================================================
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL,
  `canteen_name` VARCHAR(100) NOT NULL,
  `image` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn ảnh món ăn',
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
  CONSTRAINT `fk_prod_canteen` FOREIGN KEY (`canteen_id`) REFERENCES `canteens` (`id`) ON UPDATE CASCADE,
  INDEX `idx_products_cat` (`category_id`),
  INDEX `idx_products_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 9. BẢNG NHÓM TÙY CHỌN (Option Groups - Model: OptionGroup.ts)
-- ====================================================================
CREATE TABLE `option_groups` (
  `id` VARCHAR(50) NOT NULL COMMENT 'VD: grp-size, grp-topping',
  `canteen_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'VD: Chọn Size, Topping thêm, Mức đường',
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `min_choices` INT NOT NULL DEFAULT 0,
  `max_choices` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_opt_groups_canteen` (`canteen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 10. BẢNG LỰA CHỌN CỤ THỂ (Option Items)
-- ====================================================================
CREATE TABLE `option_items` (
  `id` VARCHAR(50) NOT NULL COMMENT 'VD: opt-size-l, opt-tranchau',
  `group_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'VD: Size L, Trân châu đen, Trứng ốp la',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_item_group` FOREIGN KEY (`group_id`) REFERENCES `option_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 11. BẢNG TÙY CHỌN RIÊNG MÓN ĂN (Product Options - Model: ProductOption.ts)
-- ====================================================================
CREATE TABLE `product_options` (
  `id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('SIZE', 'TOPPING', 'SUGAR_LEVEL', 'ICE_LEVEL', 'CUSTOM') NOT NULL,
  `is_required` BOOLEAN NOT NULL DEFAULT FALSE,
  `max_select` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_opt_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_option_items` (
  `id` VARCHAR(50) NOT NULL,
  `option_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `extra_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_item_opt` FOREIGN KEY (`option_id`) REFERENCES `product_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 12. BẢNG GIỎ HÀNG (Carts & Cart Items - Model: Cart.ts)
-- ====================================================================
CREATE TABLE `carts` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `canteen_id` VARCHAR(50) NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_items` (
  `id` VARCHAR(50) NOT NULL,
  `cart_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `selected_options_json` JSON NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 13. BẢNG ĐƠN HÀNG (Orders - Model: Order.ts)
-- ====================================================================
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_code` VARCHAR(30) NOT NULL UNIQUE,
  `user_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_phone` VARCHAR(20) NOT NULL,
  `canteen_id` VARCHAR(50) NOT NULL,
  `canteen_name` VARCHAR(100) NOT NULL,
  `voucher_id` VARCHAR(50) NULL COMMENT 'Mã giảm giá áp dụng (nếu có)',
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `discount_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `final_amount` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'DELIVERING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `order_type` ENUM('DINE_IN', 'PICKUP', 'TAKEAWAY', 'DELIVERY') NOT NULL,
  `table_id` VARCHAR(50) NULL,
  `table_number` VARCHAR(30) NULL,
  `pickup_slot` VARCHAR(50) NULL,
  `delivery_address_id` VARCHAR(50) NULL,
  `delivery_address_text` VARCHAR(255) NULL,
  `payment_method` ENUM('STUDENT_WALLET', 'CAMPUS_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY_QR', 'VNPAY', 'CASH') NOT NULL,
  `payment_status` ENUM('UNPAID', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `is_paid` BOOLEAN NOT NULL DEFAULT FALSE,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_order_canteen` FOREIGN KEY (`canteen_id`) REFERENCES `canteens` (`id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_code` (`order_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 14. BẢNG CHI TIẾT ĐƠN HÀNG (Order Details - Model: OrderDetail.ts)
-- ====================================================================
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

-- ====================================================================
-- 15. BẢNG THANH TOÁN (Payments - Model: Payment.ts)
-- ====================================================================
CREATE TABLE `payments` (
  `id` VARCHAR(50) NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `method` ENUM('STUDENT_WALLET', 'CAMPUS_WALLET', 'MOMO', 'ZALOPAY', 'VNPAY_QR', 'VNPAY', 'CASH') NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transaction_code` VARCHAR(100) NOT NULL UNIQUE,
  `gateway_response_json` JSON NULL,
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 16. BẢNG BANNER QUẢNG CÁO (Banners - Model: Banner.ts)
-- ====================================================================
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 17. BẢNG FLASH SALE GIỜ VÀNG (Flash Sales - Model: FlashSale.ts)
-- ====================================================================
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
  `start_time` TIMESTAMP NULL DEFAULT NULL, -- ĐÃ SỬA DÒNG NÀY
  `end_time` TIMESTAMP NULL DEFAULT NULL,   -- ĐÃ SỬA DÒNG NÀY
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_fs_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ====================================================================
-- 18. BẢNG KHUYẾN MÃI / VOUCHER (Vouchers - Model: Voucher.ts)
-- ====================================================================
CREATE TABLE `vouchers` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `discount_type` ENUM('PERCENTAGE', 'PERCENT', 'FIXED') NOT NULL,
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `min_order_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `max_discount` DECIMAL(12, 2) NULL,
  `usage_limit` INT NOT NULL DEFAULT 1000,
  `used_count` INT NOT NULL DEFAULT 0,
  `start_date` TIMESTAMP NULL DEFAULT NULL, -- ĐÃ SỬA Ở ĐÂY
  `end_date` TIMESTAMP NULL DEFAULT NULL,   -- ĐÃ SỬA Ở ĐÂY
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  INDEX `idx_vouchers_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo Khóa ngoại (Foreign Key) nối orders tới vouchers
ALTER TABLE `orders`
ADD CONSTRAINT `fk_order_voucher` 
FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- ====================================================================
-- 18B. BẢNG VOUCHER CÁ NHÂN CỦA SINH VIÊN (User Vouchers - Model: UserVoucher.ts)
-- ====================================================================
-- Tạo bảng trung gian để lưu kho Voucher cá nhân của từng sinh viên
CREATE TABLE `user_vouchers` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `voucher_id` VARCHAR(50) NOT NULL,
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đã sử dụng hay chưa',
  `used_at` TIMESTAMP NULL COMMENT 'Thời gian dùng mã',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_uv_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uv_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 19. BẢNG ĐÁNH GIÁ (Reviews - Model: Review.ts)
-- ====================================================================
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
  `status` ENUM('VISIBLE', 'HIDDEN') NOT NULL DEFAULT 'VISIBLE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 20. BẢNG THÔNG BÁO (Notifications - Model: Notification.ts)
-- ====================================================================
CREATE TABLE `notifications` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL COMMENT 'ID sinh viên hoặc ALL nếu gửi toàn trường',
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ORDER', 'ORDER_STATUS', 'SYSTEM', 'PROMOTION', 'WALLET') NOT NULL DEFAULT 'SYSTEM',
  `reference_id` VARCHAR(50) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- DỮ LIỆU KHỞI TẠO MẪU ĐẦY ĐỦ (COMPREHENSIVE SEED DATA)
-- Mật khẩu mặc định: 123456 (đã hash bcrypt chuẩn)
-- ====================================================================

-- 1. NGƯỜI DÙNG MẪU (Users: Student, Staff, Admin)
INSERT INTO `users` (`id`, `student_id`, `name`, `email`, `password_hash`, `phone`, `role`, `faculty`, `department`, `wallet_balance`, `avatar`, `status`) VALUES
('user-stu-1', '20230012', 'Nguyễn Văn Minh', 'minh.nv230012@sis.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0912345678', 'STUDENT', 'Công nghệ thông tin', 'K68-CNTT1', 150000.00, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
('user-stu-2', '20230045', 'Trần Thị Mai', 'mai.tt230045@sis.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0987654321', 'STUDENT', 'Kinh tế & Quản lý', 'K68-KTPM2', 85000.00, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
('user-staff-1', NULL, 'Nguyễn Văn An (Trưởng Quầy)', 'staff.a@canteen.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0901234567', 'STAFF', NULL, 'Tổ Chế Biến Căn Tin A2', 0.00, 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
('user-staff-2', NULL, 'Lê Thị Thu (Bếp Trưởng)', 'staff.b@canteen.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0902345678', 'STAFF', NULL, 'Nhà Bếp KTX B5', 0.00, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
('user-admin-1', NULL, 'Quản Trị Viên Hệ Thống', 'admin@university.edu.vn', '$2a$10$7v5J24Wq28fH2pS0sYfN3.uF6oJg0E9g2I8iB1uJ9.N1z2v4w5k8i', '0909999888', 'ADMIN', NULL, 'Ban Giám Hiệu - Phòng Quản Trị Căn Tin', 5000000.00, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'ACTIVE');

-- 2. CĂN TIN (Canteens)
INSERT INTO `canteens` (`id`, `name`, `display_name`, `code`, `location`, `distance`, `duration`, `opening_hours`, `is_open`, `rating`, `review_count`, `sold_count`, `voucher`, `freeship`, `image`, `total_tables`, `phone`) VALUES
('cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'Căng Tin A2 Campus', 'CANT-A', 'Tầng 1 Tòa A2 Giảng Đường', '150m', '5 phút', '06:30 - 21:00', TRUE, 4.9, 320, '2.5K+', 'Voucher 15K', 'Freeship KTX', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600', 35, '024 3869 1234'),
('cant-b', 'Căng Tin B - Nhà Bếp Ký Túc Xá B5', 'Căng Tin KTX B5', 'CANT-B', 'Khu B Ký Túc Xá Sinh Viên', '350m', '10 phút', '06:00 - 22:00', TRUE, 4.8, 245, '1.9K+', 'Voucher 20K', 'Freeship 0đ', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600', 40, '024 3869 5678'),
('cant-c', 'Căng Tin C - Khu Thể Thao & Dịch Vụ', 'Căng Tin Thể Thao', 'CANT-C', 'Cạnh Sân Vận Động & Nhà Thi Đấu', '500m', '12 phút', '07:00 - 20:30', TRUE, 4.7, 180, '1.1K+', 'Voucher 10K', 'Freeship KTX', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=600', 25, '024 3869 8888');

-- 3. ĐỊA CHỈ KTX (Delivery Addresses)
INSERT INTO `delivery_addresses` (`id`, `user_id`, `recipient_name`, `recipient_phone`, `dorm_block`, `room_number`, `full_address`, `notes`, `is_default`) VALUES
('addr-1', 'user-stu-1', 'Nguyễn Văn Minh', '0912345678', 'KTX B2', 'P.402', 'KTX B2, Phòng 402, Khu Ký túc xá Đại học', 'Giao tận cửa phòng, shipper có thẻ thang máy', TRUE),
('addr-2', 'user-stu-2', 'Trần Thị Mai', '0987654321', 'KTX A1', 'P.205', 'KTX A1, Phòng 205, Khu Ký túc xá Nữ', 'Giao sảnh lễ tân tầng 1 nếu đang trong giờ học', TRUE);

-- 4. BÀN ĂN & MÃ QR (Dining Tables)
INSERT INTO `dining_tables` (`id`, `table_number`, `canteen_id`, `canteen_name`, `qr_code`, `capacity`, `area`, `status`) VALUES
('tbl-1', 'BÀN A01', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_01', 4, 'Sảnh Giảng Đường', 'AVAILABLE'),
('tbl-2', 'BÀN A02', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_02', 4, 'Sảnh Giảng Đường', 'OCCUPIED'),
('tbl-3', 'BÀN A03', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_A_TBL_03', 6, 'Phòng Máy Lạnh Tầng 2', 'AVAILABLE'),
('tbl-4', 'BÀN B01', 'cant-b', 'Căng Tin B - Nhà Bếp Ký Túc Xá B5', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_B_TBL_01', 4, 'Khu Sân Vườn KTX', 'AVAILABLE'),
('tbl-5', 'BÀN B02', 'cant-b', 'Căng Tin B - Nhà Bếp Ký Túc Xá B5', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CANT_B_TBL_02', 8, 'Bàn Nhóm Học Tập', 'OCCUPIED');

-- 5. KHUNG GIỜ PICKUP (Pickup Slots)
INSERT INTO `pickup_slots` (`id`, `canteen_id`, `time_range`, `max_orders`, `current_orders`, `status`) VALUES
('slot-1', 'cant-a', '11:00 - 11:15', 30, 18, 'AVAILABLE'),
('slot-2', 'cant-a', '11:15 - 11:30', 30, 28, 'AVAILABLE'),
('slot-3', 'cant-a', '11:30 - 11:45', 35, 35, 'FULL'),
('slot-4', 'cant-a', '11:45 - 12:00', 35, 22, 'AVAILABLE'),
('slot-5', 'cant-a', '12:00 - 12:15', 30, 14, 'AVAILABLE'),
('slot-6', 'cant-b', '11:30 - 11:45', 25, 12, 'AVAILABLE');

-- 6. DANH MỤC MÓN ĂN (Categories)
INSERT INTO `categories` (`id`, `name`, `icon`, `slug`, `image`, `description`, `display_order`, `is_active`) VALUES
('cat-1', 'Cơm Sinh Viên', '🍛', 'mon-com', 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', 'Cơm gà chiên mắm, sườn bì chả, bò xào dưa chua', 1, TRUE),
('cat-2', 'Bún & Phở Nóng', '🍜', 'bun-pho', 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', 'Phở bò tái nạm, bún chả nướng, bún bò huế hầm xương 12h', 2, TRUE),
('cat-3', 'Đồ Uống Giải Khát', '🧋', 'do-uong', 'https://cdn-icons-png.flaticon.com/512/3081/3081996.png', 'Trà đào cam sả, trà sữa trân châu, cà phê muối xứ Huế', 3, TRUE),
('cat-4', 'Ăn Vặt & Bánh Mì', '🥪', 'an-vat', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', 'Bánh mì xá xíu pate, khoai tây lắc phô mai giòn rụm', 4, TRUE),
('cat-5', 'Mì & Fast Food', '🍝', 'fast-food', 'https://cdn-icons-png.flaticon.com/512/3081/3081944.png', 'Mì Ý sốt bò bằm phô mai kéo sợi, burger gà giòn', 5, TRUE);

-- 7. MÓN ĂN (Products)
INSERT INTO `products` (`id`, `name`, `price`, `original_price`, `category_id`, `canteen_id`, `canteen_name`, `image`, `description`, `rating`, `review_count`, `preparation_time`, `calories`, `is_available`, `is_bestseller`, `is_new`, `is_vegetarian`, `sold_count`) VALUES
('prod-1', 'Cơm Gà Chiên Mắm Tỏi Giòn', 35000.00, 45000.00, 'cat-1', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', 'Đùi gà góc tư chiên giòn rụm xốt mắm tỏi ớt đặc trưng, kèm dưa chuột và canh nóng.', 4.9, 184, 10, 620, TRUE, TRUE, FALSE, FALSE, 380),
('prod-2', 'Cơm Tấm Sườn Bì Chả Đặc Biệt', 38000.00, 45000.00, 'cat-1', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600', 'Sườn cốt lết nướng than hoa mật ong, chả trứng hấp béo ngậy cùng bì heo chuẩn vị.', 4.8, 210, 12, 680, TRUE, TRUE, FALSE, FALSE, 450),
('prod-3', 'Phở Bò Tái Nạm Truyền Thống', 35000.00, 42000.00, 'cat-2', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600', 'Nước dùng hầm xương bò 12 tiếng thơm nức mũi hương gừng quế, thịt bò mềm ngọt.', 4.9, 312, 8, 520, TRUE, TRUE, FALSE, FALSE, 520),
('prod-4', 'Bún Bò Huế Chả Cua Thịt Bắp', 38000.00, 45000.00, 'cat-2', 'cant-b', 'Căng Tin B - Nhà Bếp Ký Túc Xá B5', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600', 'Sợi bún to, thịt bắp hoa giòn sần sật, viên chả cua xứ Huế thơm nức mùi mắm ruốc.', 4.8, 190, 10, 580, TRUE, FALSE, FALSE, FALSE, 280),
('prod-5', 'Trà Đào Cam Sả Khổng Lồ 700ml', 20000.00, 25000.00, 'cat-3', 'cant-c', 'Căng Tin C - Khu Thể Thao & Dịch Vụ', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600', 'Thanh mát sảng khoái sau giờ học, miếng đào giòn ngọt kèm sả cam tươi tự nhiên.', 4.9, 420, 5, 180, TRUE, TRUE, FALSE, TRUE, 780),
('prod-6', 'Trà Sữa Trân Châu Đường Đen', 25000.00, 32000.00, 'cat-3', 'cant-c', 'Căng Tin C - Khu Thể Thao & Dịch Vụ', 'https://images.unsplash.com/photo-1558857563-b37cf5a31a54?auto=format&fit=crop&q=80&w=600', 'Trà sữa đậm vị hồng trà cao cấp, trân châu nấu đường đen dẻo thơm nức mũi.', 4.8, 290, 5, 340, TRUE, TRUE, FALSE, TRUE, 640),
('prod-7', 'Bánh Mì Kẹp Thịt Nướng Xá Xíu', 20000.00, 25000.00, 'cat-4', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600', 'Vỏ giòn rụm, nhân thịt xá xíu đậm vị cùng pate béo ngậy và sốt ớt cay kích thích vị giác.', 4.7, 140, 5, 410, TRUE, FALSE, TRUE, FALSE, 310),
('prod-8', 'Mì Ý Sốt Bò Bằm Phô Mai', 35000.00, 42000.00, 'cat-5', 'cant-c', 'Căng Tin C - Khu Thể Thao & Dịch Vụ', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600', 'Sợi mì spaghetti dai ngon quyện sốt cà chua thịt bò bằm đậm đà và phô mai Mozzarella.', 4.8, 160, 12, 590, TRUE, FALSE, TRUE, FALSE, 210);

-- 8. TÙY CHỌN MÓN (Product Options & Items)
INSERT INTO `product_options` (`id`, `product_id`, `name`, `type`, `is_required`, `max_select`) VALUES
('opt-1', 'prod-1', 'Chọn Kích Cỡ', 'SIZE', TRUE, 1),
('opt-2', 'prod-1', 'Thêm Topping Cơm Gà', 'TOPPING', FALSE, 3),
('opt-3', 'prod-5', 'Chọn Lượng Đường', 'SUGAR_LEVEL', TRUE, 1),
('opt-4', 'prod-6', 'Chọn Topping Trà Sữa', 'TOPPING', FALSE, 3);

INSERT INTO `product_option_items` (`id`, `option_id`, `name`, `extra_price`, `is_default`) VALUES
('opt-item-1', 'opt-1', 'Suất Vừa (Chuẩn)', 0.00, TRUE),
('opt-item-2', 'opt-1', 'Suất Lớn (Thêm Cơm & Gà To)', 10000.00, FALSE),
('opt-item-3', 'opt-2', 'Trứng ốp la lòng đào', 5000.00, FALSE),
('opt-item-4', 'opt-2', 'Kim chi cay Hàn Quốc', 4000.00, FALSE),
('opt-item-5', 'opt-3', '100% Đường (Chuẩn)', 0.00, TRUE),
('opt-item-6', 'opt-3', '50% Đường (Ít ngọt)', 0.00, FALSE),
('opt-item-7', 'opt-4', 'Trân châu đen dẻo', 5000.00, TRUE),
('opt-item-8', 'opt-4', 'Pudding trứng béo bùi', 6000.00, FALSE);

-- 9. ĐƠN HÀNG MẪU (Orders: DINE_IN, PICKUP, DELIVERY)
INSERT INTO `orders` (`id`, `order_code`, `user_id`, `user_name`, `user_phone`, `canteen_id`, `canteen_name`, `total_amount`, `discount_amount`, `final_amount`, `status`, `order_type`, `table_number`, `pickup_slot`, `delivery_address_text`, `payment_method`, `payment_status`, `is_paid`, `notes`) VALUES
('ord-1', 'ORD-20260923', 'user-stu-1', 'Nguyễn Văn Minh', '0912345678', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 45000.00, 0.00, 45000.00, 'COMPLETED', 'DINE_IN', 'BÀN A01', NULL, NULL, 'STUDENT_WALLET', 'PAID', TRUE, 'Cho nhiều nước sốt gà'),
('ord-2', 'ORD-20260924', 'user-stu-2', 'Trần Thị Mai', '0987654321', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 65000.00, 10000.00, 55000.00, 'CONFIRMED', 'PICKUP', NULL, '11:45 - 12:00', NULL, 'MOMO', 'PAID', TRUE, 'Không lấy ớt tươi'),
('ord-3', 'ORD-20260925', 'user-stu-1', 'Nguyễn Văn Minh', '0912345678', 'cant-b', 'Căng Tin B - Nhà Bếp Ký Túc Xá B5', 43000.00, 0.00, 43000.00, 'DELIVERING', 'DELIVERY', NULL, NULL, 'KTX B2 - Phòng 402', 'CASH', 'UNPAID', FALSE, 'Giao tận cửa phòng, shipper có thẻ thang máy'),
('ord-4', 'ORD-20260926', 'user-stu-2', 'Trần Thị Mai', '0987654321', 'cant-a', 'Căng Tin A - Giảng Đường Trung Tâm A2', 35000.00, 0.00, 35000.00, 'PENDING', 'DINE_IN', 'BÀN A02', NULL, NULL, 'VNPAY_QR', 'PAID', TRUE, 'Ít hành lá');

-- 10. CHI TIẾT ĐƠN HÀNG (Order Details)
INSERT INTO `order_details` (`id`, `order_id`, `product_id`, `product_name`, `product_image`, `unit_price`, `quantity`, `item_subtotal`, `notes`) VALUES
('od-1', 'ord-1', 'prod-1', 'Cơm Gà Chiên Mắm Tỏi Giòn', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', 45000.00, 1, 45000.00, 'Suất Lớn'),
('od-2', 'ord-2', 'prod-2', 'Cơm Tấm Sườn Bì Chả Đặc Biệt', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600', 38000.00, 1, 38000.00, NULL),
('od-3', 'ord-2', 'prod-5', 'Trà Đào Cam Sả Khổng Lồ 700ml', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600', 20000.00, 1, 20000.00, '50% Đường'),
('od-4', 'ord-3', 'prod-4', 'Bún Bò Huế Chả Cua Thịt Bắp', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600', 38000.00, 1, 38000.00, 'Giao KTX'),
('od-5', 'ord-4', 'prod-3', 'Phở Bò Tái Nạm Truyền Thống', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600', 35000.00, 1, 35000.00, 'Ăn tại bàn A02');

-- 11. GIAO DỊCH THANH TOÁN (Payments)
INSERT INTO `payments` (`id`, `order_id`, `user_id`, `amount`, `method`, `status`, `transaction_code`, `paid_at`) VALUES
('pay-1', 'ord-1', 'user-stu-1', 45000.00, 'STUDENT_WALLET', 'SUCCESS', 'TXN-984210', NOW() - INTERVAL 2 HOUR),
('pay-2', 'ord-2', 'user-stu-2', 55000.00, 'MOMO', 'SUCCESS', 'TXN-984209', NOW() - INTERVAL 1 HOUR),
('pay-3', 'ord-4', 'user-stu-2', 35000.00, 'VNPAY_QR', 'SUCCESS', 'TXN-984208', NOW() - INTERVAL 15 MINUTE);

-- 12. BANNER QUẢNG CÁO (Banners)
INSERT INTO `banners` (`id`, `title`, `subtitle`, `image_url`, `link_url`, `target_type`, `target_id`, `display_order`, `is_active`) VALUES
('ban-1', 'Combo Cơm Gà Chiên Mắm Tỏi', 'TẶNG NGAY 1 Trà Đào Sảng Khoái khi đặt combo trưa', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200', NULL, 'PRODUCT', 'prod-1', 1, TRUE),
('ban-2', 'Đồng Giá 19.000đ Bún & Phở Nóng', 'Giảm tới 45% khung giờ vàng 11h30 - 13h30 tại Căng tin B', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1200', NULL, 'CATEGORY', 'cat-2', 2, TRUE),
('ban-3', 'Giao Hàng 0 Đồng Tận Phòng KTX', 'Nhập mã FREESHIPKTX - Đội shipper sinh viên giao 15 phút', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=1200', NULL, 'CATEGORY', 'cat-1', 3, TRUE);

-- 13. FLASH SALE GIỜ VÀNG (Flash Sales)
INSERT INTO `flash_sales` (`id`, `title`, `description`, `product_id`, `original_price`, `sale_price`, `discount_percent`, `total_slots`, `sold_slots`, `start_time`, `end_time`, `is_active`) VALUES
('fs-1', 'Flash Sale Giờ Vàng Cơm Gà', 'Đùi gà chiên giòn rụm xốt mắm tỏi giờ nghỉ trưa', 'prod-1', 45000.00, 25000.00, 44, 100, 68, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 2 HOUR, TRUE),
('fs-2', 'Trà Đào Hạ Nhiệt Buổi Chiều', 'Ly 700ml giải nhiệt thi cử sảng khoái', 'prod-5', 25000.00, 15000.00, 40, 80, 52, NOW() - INTERVAL 1 HOUR, NOW() + INTERVAL 3 HOUR, TRUE);

-- 14. MÃ GIẢM GIÁ / VOUCHERS (Vouchers)
INSERT INTO `vouchers` (`id`, `code`, `title`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `is_active`) VALUES
('vouch-1', 'KHAIGIANG20', 'Giảm 20% Chào Kỳ Mới', 'Giảm 20% tối đa 15K cho đơn từ 35.000đ', 'PERCENT', 20.00, 35000.00, 15000.00, 500, 124, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE),
('vouch-2', 'FREESHIPKTX', 'Miễn Phí Giao KTX', 'Giảm 10.000đ phí giao hàng tới KTX Khu A, B', 'FIXED', 10000.00, 30000.00, NULL, 1000, 310, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 30 DAY, TRUE),
('vouch-3', 'UNIEAT50', 'Giảm 50% Món Thứ Hai', 'Giảm 50% tối đa 20.000đ cho đơn từ 60.000đ', 'PERCENT', 50.00, 60000.00, 20000.00, 200, 45, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 20 DAY, TRUE);

-- 14B. KHO VOUCHER CÁ NHÂN SINH VIÊN (User Vouchers)
INSERT INTO `user_vouchers` (`id`, `user_id`, `voucher_id`, `is_used`, `used_at`) VALUES
('uv-1', 'user-stu-1', 'vouch-1', FALSE, NULL),
('uv-2', 'user-stu-1', 'vouch-2', TRUE, NOW() - INTERVAL 1 DAY),
('uv-3', 'user-stu-2', 'vouch-3', FALSE, NULL);

-- 15. ĐÁNH GIÁ (Reviews)
INSERT INTO `reviews` (`id`, `user_id`, `user_name`, `target_type`, `target_id`, `rating`, `comment`, `verified_purchase`, `helpful_count`, `status`) VALUES
('rev-1', 'user-stu-1', 'Nguyễn Văn Minh', 'PRODUCT', 'prod-1', 5, 'Đùi gà to giòn rụm xốt mắm tỏi thơm điếc mũi! Có kèm canh nóng và dưa chuột ăn rất vừa miệng.', TRUE, 12, 'VISIBLE'),
('rev-2', 'user-stu-2', 'Trần Thị Mai', 'PRODUCT', 'prod-5', 5, 'Trà đào ly to uống đã khát cực kỳ, nhiều miếng đào giòn ngọt thơm lừng mùi sả, trưa nào cũng uống.', TRUE, 8, 'VISIBLE'),
('rev-3', 'user-stu-1', 'Nguyễn Văn Minh', 'PRODUCT', 'prod-3', 5, 'Phở bò tái lăn nước dùng trong mà ngọt lịm từ xương, thịt bò mềm xào chín tới thơm mùi tiêu.', TRUE, 15, 'VISIBLE');

-- 16. THÔNG BÁO HỆ THỐNG (Notifications)
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `reference_id`, `is_read`) VALUES
('notif-1', 'user-stu-1', 'Đơn hàng #ORD-20260923 đã hoàn thành!', 'Bếp đã chế biến xong suất Cơm Gà Chiên Mắm Tỏi. Mời bạn lại quầy lấy món.', 'ORDER', 'ord-1', TRUE),
('notif-2', 'user-stu-1', '⚡ Flash Sale 11h30 bắt đầu!', 'Giảm tới 45% toàn bộ Bún & Phở Nóng tại Căng tin B. Săn ngay kẻo hết suất!', 'PROMOTION', 'fs-1', FALSE),
('notif-3', 'user-stu-1', 'Nạp tiền ví Campus thành công', 'Bạn vừa nạp 150.000đ vào ví UniEat qua VNPay. Số dư hiện tại: 150.000đ.', 'WALLET', 'pay-1', TRUE);
