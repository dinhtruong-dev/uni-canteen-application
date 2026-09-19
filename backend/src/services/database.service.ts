import {
  User,
  DeliveryAddress,
  Favorite,
  DiningTable,
  Category,
  Product,
  ProductOption,
  ProductOptionItem,
  Cart,
  CartItem,
  Order,
  OrderDetail,
  Payment,
  Banner,
  FlashSale,
  Voucher,
  Review,
  Notification,
} from '../models';

export class DatabaseService {
  private static instance: DatabaseService;

  // Collections (In-Memory Database)
  public users: Map<string, User> = new Map();
  public addresses: Map<string, DeliveryAddress> = new Map();
  public favorites: Map<string, Favorite> = new Map();
  public tables: Map<string, DiningTable> = new Map();
  public categories: Map<string, Category> = new Map();
  public products: Map<string, Product> = new Map();
  public productOptions: Map<string, ProductOption> = new Map();
  public carts: Map<string, Cart> = new Map();
  public orders: Map<string, Order> = new Map();
  public payments: Map<string, Payment> = new Map();
  public banners: Map<string, Banner> = new Map();
  public flashSales: Map<string, FlashSale> = new Map();
  public vouchers: Map<string, Voucher> = new Map();
  public reviews: Map<string, Review> = new Map();
  public notifications: Map<string, Notification> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private seedInitialData(): void {
    // 1. Group 1: Users, DeliveryAddresses, Favorites
    const user1 = new User('user-stu-1', 'Đặng Hoàng Minh', 'minh.dh22@university.edu.vn', '0987654321', 'STUDENT', {
      studentId: 'SV20220192',
      faculty: 'Khoa Công Nghệ Thông Tin',
      walletBalance: 150000,
    });
    const user2 = new User('user-stu-2', 'Trần Thị Mai Phương', 'phuong.ttm23@university.edu.vn', '0977888999', 'STUDENT', {
      studentId: 'SV20230514',
      faculty: 'Khoa Kinh Tế Quốc Tế',
      walletBalance: 85000,
    });
    const staff1 = new User('user-staff-1', 'Cô Nguyễn Thị Lan (Bếp trưởng)', 'lan.canteen@university.edu.vn', '0912345678', 'STAFF', {
      department: 'Tổ Chế Biến Căng Tin A2',
    });
    const admin1 = new User('user-admin-1', 'Thầy Nguyễn Tuấn Anh', 'admin.canteen@university.edu.vn', '0909999888', 'ADMIN', {
      department: 'Phòng Quản Trị Đời Sống & Căng Tin Trường',
    });

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(staff1.id, staff1);
    this.users.set(admin1.id, admin1);

    const addr1 = new DeliveryAddress('addr-1', user1.id, 'Đặng Hoàng Minh', '0987654321', 'KTX A1', 'Phòng 402', 'Giao tận cửa phòng, bấm chuông giúp mình', true);
    const addr2 = new DeliveryAddress('addr-2', user1.id, 'Đặng Hoàng Minh', '0987654321', 'Tòa Nhà Giảng Đường A2', 'Phòng Hội Thảo 301', 'Giao vào giờ giải lao', false);
    this.addresses.set(addr1.id, addr1);
    this.addresses.set(addr2.id, addr2);

    const fav1 = new Favorite('fav-1', user1.id, 'PRODUCT', 'prod-1');
    const fav2 = new Favorite('fav-2', user1.id, 'PRODUCT', 'prod-5');
    this.favorites.set(fav1.id, fav1);
    this.favorites.set(fav2.id, fav2);

    // 2. Group 2: DiningTables (Bàn ăn & Mã QR)
    const table1 = new DiningTable('tbl-1', 'Bàn 01', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CANT_A_TBL_01', 4, 'Tầng 1 - Sân trước', 'AVAILABLE');
    const table2 = new DiningTable('tbl-2', 'Bàn 02', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CANT_A_TBL_02', 4, 'Tầng 1 - Sân trước', 'OCCUPIED', 'ord-101');
    const table3 = new DiningTable('tbl-3', 'Bàn 03', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CANT_A_TBL_03', 6, 'Tầng 2 - Phòng Lạnh', 'AVAILABLE');
    const table4 = new DiningTable('tbl-4', 'Bàn 04', 'cant-a', 'Căng tin A2', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CANT_A_TBL_04', 2, 'Góc Sân Vườn', 'AVAILABLE');
    this.tables.set(table1.id, table1);
    this.tables.set(table2.id, table2);
    this.tables.set(table3.id, table3);
    this.tables.set(table4.id, table4);

    // 3. Group 3: Menu (Categories, Products, ProductOptions)
    const cat1 = new Category('cat-1', 'Cơm Sinh Viên', 'Utensils', 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', 1, 'Cơm chiên, sườn bì chả, cơm gà');
    const cat2 = new Category('cat-2', 'Bún & Phở Nóng', 'Soup', 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', 2, 'Nước dùng đậm đà thơm ngon');
    const cat3 = new Category('cat-3', 'Đồ Uống Giải Khát', 'Coffee', 'https://cdn-icons-png.flaticon.com/512/3081/3081996.png', 3, 'Trà hoa quả, cà phê, trà sữa');
    const cat4 = new Category('cat-4', 'Ăn Vặt & Bánh Mì', 'Sandwich', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', 4, 'Bánh mì pate, khoai lắc');
    this.categories.set(cat1.id, cat1);
    this.categories.set(cat2.id, cat2);
    this.categories.set(cat3.id, cat3);
    this.categories.set(cat4.id, cat4);

    // Options for Product 1 (Cơm gà)
    const optSizeChicken = new ProductOption('opt-1', 'prod-1', 'Chọn Kích Cỡ', 'SIZE', true, 1, [
      new ProductOptionItem('opt-item-1', 'Suất Vừa (Chuẩn)', 0, true),
      new ProductOptionItem('opt-item-2', 'Suất Lớn (Thêm Cơm & Đùi To)', 10000),
    ]);
    const optToppingChicken = new ProductOption('opt-2', 'prod-1', 'Thêm Topping', 'TOPPING', false, 3, [
      new ProductOptionItem('opt-item-3', 'Trứng ốp la lòng đào', 5000),
      new ProductOptionItem('opt-item-4', 'Canh rong biển thịt bằm', 5000),
      new ProductOptionItem('opt-item-5', 'Kim chi cay Hàn Quốc', 4000),
    ]);
    this.productOptions.set(optSizeChicken.id, optSizeChicken);
    this.productOptions.set(optToppingChicken.id, optToppingChicken);

    // Options for Product 5 (Trà Đào)
    const optSweetLevel = new ProductOption('opt-3', 'prod-5', 'Lượng Đường', 'SUGAR_LEVEL', true, 1, [
      new ProductOptionItem('opt-item-6', '100% Đường (Chuẩn)', 0, true),
      new ProductOptionItem('opt-item-7', '70% Đường (Vừa)', 0),
      new ProductOptionItem('opt-item-8', '50% Đường (Ít ngọt)', 0),
      new ProductOptionItem('opt-item-9', 'Không đường', 0),
    ]);
    const optIceLevel = new ProductOption('opt-4', 'prod-5', 'Lượng Đá', 'ICE_LEVEL', true, 1, [
      new ProductOptionItem('opt-item-10', '100% Đá', 0, true),
      new ProductOptionItem('opt-item-11', '50% Đá', 0),
      new ProductOptionItem('opt-item-12', 'Không đá', 0),
    ]);
    this.productOptions.set(optSweetLevel.id, optSweetLevel);
    this.productOptions.set(optIceLevel.id, optIceLevel);

    const prod1 = new Product(
      'prod-1',
      'Cơm Gà Chiên Mắm Tỏi Giòn',
      35000,
      'cat-1',
      'cant-a',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
      4.9,
      180,
      10,
      true,
      {
        originalPrice: 45000,
        categoryName: 'Cơm Sinh Viên',
        canteenName: 'Căng tin A2',
        description: 'Đùi gà góc tư chiên giòn rụm xốt mắm tỏi ớt đặc trưng, ăn kèm dưa chuột và canh rau dền nóng hổi.',
        isBestSeller: true,
        soldCount: 380,
        calories: 620,
        options: [optSizeChicken, optToppingChicken],
      }
    );

    const prod2 = new Product(
      'prod-2',
      'Cơm Tấm Sườn Bì Chả Đặc Biệt',
      38000,
      'cat-1',
      'cant-a',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
      4.8,
      210,
      12,
      true,
      {
        originalPrice: 45000,
        categoryName: 'Cơm Sinh Viên',
        canteenName: 'Căng tin A2',
        description: 'Sườn cốt lết nướng than hoa mật ong, chả trứng hấp béo bùi cùng bì heo dai giòn chuẩn vị Sài Gòn.',
        isBestSeller: true,
        soldCount: 450,
        calories: 680,
      }
    );

    const prod3 = new Product(
      'prod-3',
      'Phở Bò Tái Lăn Hà Nội',
      35000,
      'cat-2',
      'cant-b',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600',
      4.9,
      312,
      8,
      true,
      {
        originalPrice: 42000,
        categoryName: 'Bún & Phở Nóng',
        canteenName: 'Căng tin B (KTX)',
        description: 'Nước dùng hầm xương bò 12 tiếng thơm nức mũi hương gừng quế, thịt bò xào lăn mềm ngọt đậm đà.',
        isBestSeller: true,
        soldCount: 520,
      }
    );

    const prod4 = new Product(
      'prod-4',
      'Bánh Mì Kẹp Thịt Nướng Xá Xíu',
      20000,
      'cat-4',
      'cant-a',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
      4.7,
      140,
      5,
      true,
      {
        categoryName: 'Ăn Vặt & Bánh Mì',
        canteenName: 'Căng tin A2',
        description: 'Vỏ giòn rụm, nhân thịt xá xíu đậm vị cùng pate béo ngậy và sốt ớt cay nhẹ.',
        soldCount: 310,
      }
    );

    const prod5 = new Product(
      'prod-5',
      'Trà Đào Cam Sả Khổng Lồ 700ml',
      20000,
      'cat-3',
      'cant-c',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
      4.9,
      420,
      5,
      true,
      {
        originalPrice: 25000,
        categoryName: 'Đồ Uống Giải Khát',
        canteenName: 'Căng tin C',
        description: 'Thanh mát sảng khoái sau những giờ học căng thẳng, miếng đào giòn ngọt kèm sả cam tươi.',
        isBestSeller: true,
        soldCount: 780,
        options: [optSweetLevel, optIceLevel],
      }
    );

    this.products.set(prod1.id, prod1);
    this.products.set(prod2.id, prod2);
    this.products.set(prod3.id, prod3);
    this.products.set(prod4.id, prod4);
    this.products.set(prod5.id, prod5);

    // 4. Group 4: Cart & CartItem
    const cart1 = new Cart('cart-user-1', user1.id, 'cant-a', [
      new CartItem('ci-1', 'cart-user-1', prod1.id, prod1.name, prod1.image, prod1.price, 1, [
        { optionId: 'opt-2', optionName: 'Thêm Topping', itemId: 'opt-item-3', itemName: 'Trứng ốp la lòng đào', extraPrice: 5000 },
      ], 'Làm giòn giúp mình'),
    ]);
    this.carts.set(cart1.userId, cart1);

    // 5. Group 5: Order, OrderDetail, Payment
    const od1 = new OrderDetail('od-1', 'ord-101', prod1.id, prod1.name, prod1.image, 35000, 1, [
      { optionId: 'opt-2', optionName: 'Thêm Topping', itemId: 'opt-item-3', itemName: 'Trứng ốp la lòng đào', extraPrice: 5000 },
    ], 'Ăn tại bàn');
    const od2 = new OrderDetail('od-2', 'ord-101', prod5.id, prod5.name, prod5.image, 20000, 1, [
      { optionId: 'opt-3', optionName: 'Lượng Đường', itemId: 'opt-item-7', itemName: '70% Đường', extraPrice: 0 },
    ]);

    const order1 = new Order(
      'ord-101',
      'ORD-8291',
      user1.id,
      user1.name,
      user1.phone,
      'cant-a',
      'Căng tin A2',
      [od1, od2],
      'DINE_IN',
      'CAMPUS_WALLET',
      {
        tableId: 'tbl-2',
        tableNumber: 'Bàn 02',
        discountAmount: 10000,
        status: 'PREPARING',
        isPaid: true,
        createdAt: new Date(Date.now() - 20 * 60 * 1000),
      }
    );

    const payment1 = new Payment('pay-1', order1.id, user1.id, order1.finalAmount, 'CAMPUS_WALLET', 'SUCCESS', 'TX-CAMPUS-99120', {
      paidAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    this.orders.set(order1.id, order1);
    this.payments.set(payment1.id, payment1);

    // 6. Group 6: Marketing (Banner, FlashSale, Voucher)
    const b1 = new Banner('ban-1', 'Đại Tiệc Khai Giảng - Giảm 50%', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200', 1, true, {
      subtitle: 'Áp dụng cho toàn bộ đồ uống và cơm trưa',
      targetType: 'CATEGORY',
      targetId: 'cat-1',
    });
    const b2 = new Banner('ban-2', 'Combo Căng Tin Tiết Kiệm Chỉ 25K', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', 2, true, {
      subtitle: 'Dành riêng cho sinh viên KTX các trường Đại Học',
      targetType: 'PRODUCT',
      targetId: 'prod-1',
    });
    this.banners.set(b1.id, b1);
    this.banners.set(b2.id, b2);

    const fs1 = new FlashSale(
      'fs-1',
      'Flash Sale Giờ Vàng 11h - 13h',
      prod1.id,
      prod1.name,
      prod1.image,
      45000,
      25000,
      100,
      68,
      new Date(Date.now() - 30 * 60 * 1000),
      new Date(Date.now() + 2 * 3600 * 1000),
      true,
      'Săn Cơm Gà Giòn Mắm Tỏi giá sốc giờ nghỉ trưa'
    );
    const fs2 = new FlashSale(
      'fs-2',
      'Trà Đào Hạ Nhiệt Buổi Chiều',
      prod5.id,
      prod5.name,
      prod5.image,
      25000,
      15000,
      80,
      42,
      new Date(Date.now() - 10 * 60 * 1000),
      new Date(Date.now() + 3 * 3600 * 1000),
      true,
      'Chỉ 15K ly trà đào khổng lồ'
    );
    this.flashSales.set(fs1.id, fs1);
    this.flashSales.set(fs2.id, fs2);

    const v1 = new Voucher('vouch-1', 'KHAIGIANG20', 'Giảm 20% Chào Kỳ Mới', 'Giảm 20% tối đa 15K cho đơn từ 35.000đ', 'PERCENTAGE', 20, 35000, {
      maxDiscount: 15000,
      usageLimit: 500,
      usedCount: 124,
    });
    const v2 = new Voucher('vouch-2', 'FREESHIPKTX', 'Miễn Phí Giao KTX', 'Giảm 10.000đ phí giao hàng tới KTX A, B', 'FIXED', 10000, 30000, {
      usageLimit: 1000,
      usedCount: 310,
    });
    const v3 = new Voucher('vouch-3', 'BANMOI10K', 'Tặng 10K Sinh Viên Mới', 'Giảm trực tiếp 10K đơn đầu tiên', 'FIXED', 10000, 25000, {
      usageLimit: 300,
      usedCount: 88,
    });
    this.vouchers.set(v1.id, v1);
    this.vouchers.set(v2.id, v2);
    this.vouchers.set(v3.id, v3);

    // 7. Group 7: Reviews & Notifications
    const r1 = new Review('rev-1', user1.id, user1.name, 'PRODUCT', prod1.id, 5, 'Đùi gà giòn rụm, xốt mắm thơm phức, ăn kèm dưa chuột rất vừa miệng!', {
      userRole: 'Sinh viên năm 3 • CNTT',
      helpfulCount: 18,
    });
    const r2 = new Review('rev-2', user2.id, user2.name, 'PRODUCT', prod5.id, 5, 'Trà đào vị thanh mát sảng khoái, nhiều đào giòn sần sật, ly to đùng!', {
      userRole: 'Sinh viên năm 2 • Kinh tế',
      helpfulCount: 11,
    });
    this.reviews.set(r1.id, r1);
    this.reviews.set(r2.id, r2);

    const n1 = new Notification('notif-1', user1.id, 'Đơn hàng đang chuẩn bị', 'Bếp đang làm món Cơm Gà của bạn tại Căng tin A2. Dự kiến hoàn thành trong 8 phút nữa.', 'ORDER_STATUS', order1.id, false);
    const n2 = new Notification('notif-2', 'ALL', 'Khai giảng kỳ mới: Nạp ví tặng 10%', 'Nạp tiền vào ví sinh viên qua MoMo/ZaloPay tặng ngay 10% giá trị nạp trong tuần này!', 'PROMOTION', undefined, false);
    this.notifications.set(n1.id, n1);
    this.notifications.set(n2.id, n2);
  }
}

export const db = DatabaseService.getInstance();
