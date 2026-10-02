import {
  User,
  DeliveryAddress,
  Favorite,
  DiningTable,
  Category,
  Product,
  ProductOption,
  ProductOptionItem,
  OptionGroup,
  OptionItem,
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
  Canteen,
  SearchHistoryItem,
  PickupSlot,
} from '../models';

export class DatabaseService {
  private static instance: DatabaseService;

  // Collections (In-Memory Database)
  public users: Map<string, User> = new Map();
  public addresses: Map<string, DeliveryAddress> = new Map();
  public favorites: Map<string, Favorite> = new Map();
  public tables: Map<string, DiningTable> = new Map();
  public pickupSlots: Map<string, PickupSlot> = new Map();
  public categories: Map<string, Category> = new Map();
  public products: Map<string, Product> = new Map();
  public productOptions: Map<string, ProductOption> = new Map();
  public optionGroups: Map<string, OptionGroup> = new Map();
  public optionItems: Map<string, OptionItem> = new Map();
  public carts: Map<string, Cart> = new Map();
  public orders: Map<string, Order> = new Map();
  public payments: Map<string, Payment> = new Map();
  public banners: Map<string, Banner> = new Map();
  public flashSales: Map<string, FlashSale> = new Map();
  public vouchers: Map<string, Voucher> = new Map();
  public reviews: Map<string, Review> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public canteens: Map<string, Canteen> = new Map();
  public searchHistories: Map<string, SearchHistoryItem> = new Map();

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

    // Pickup Slots (Khung giờ nhận món theo ca)
    const slotTimes = [
      { time: '10:45 - 11:00', max: 20, cur: 8 },
      { time: '11:00 - 11:15', max: 25, cur: 19 },
      { time: '11:15 - 11:30', max: 25, cur: 24 },
      { time: '11:30 - 11:45', max: 30, cur: 30, status: 'FULL' as const },
      { time: '11:45 - 12:00', max: 30, cur: 22 },
      { time: '12:00 - 12:15', max: 25, cur: 15 },
      { time: '12:15 - 12:30', max: 20, cur: 10 },
      { time: '12:30 - 12:45', max: 15, cur: 5 },
      { time: '12:45 - 13:00', max: 15, cur: 2 },
    ];
    slotTimes.forEach((st, idx) => {
      const ps = new PickupSlot(`ps-${idx + 1}`, 'cant-a', st.time, st.max, st.cur, st.status || 'AVAILABLE');
      this.pickupSlots.set(ps.id, ps);
    });

    // 3. Group 3: Menu (Categories, Products, ProductOptions)
    const cat1 = new Category('cat-1', 'Cơm Sinh Viên', 'Utensils', 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', 1, 'Cơm chiên, sườn bì chả, cơm gà mắm tỏi');
    const cat2 = new Category('cat-2', 'Bún & Phở Nóng', 'Soup', 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', 2, 'Phở bò tái nạm, bún chả nướng than, bún đậu mắm tôm');
    const cat3 = new Category('cat-3', 'Đồ Uống Giải Khát', 'GlassWater', 'https://cdn-icons-png.flaticon.com/512/3081/3081996.png', 3, 'Trà đào cam sả, nước ép tươi, sinh tố bơ');
    const cat4 = new Category('cat-4', 'Ăn Vặt & Bánh Mì', 'Sandwich', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', 4, 'Bánh mì thịt nướng, bánh mì pate, khoai tây lắc phô mai');
    const cat5 = new Category('cat-5', 'Trà Sữa & Cà Phê Sinh Viên', 'Coffee', 'https://cdn-icons-png.flaticon.com/512/3050/3050117.png', 5, 'Trà sữa trân châu sợi, matcha latte 26k, cà phê muối, bạc xỉu');
    const cat6 = new Category('cat-6', 'Món Tráng Miệng & Chè', 'IceCream', 'https://cdn-icons-png.flaticon.com/512/938/938063.png', 6, 'Chè dưỡng nhan tuyết yến, bánh flan caramen, sữa chua dẻo');
    const cat7 = new Category('cat-7', 'Món Chay Thanh Tịnh', 'Leaf', 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png', 7, 'Cơm chay thập cẩm nấm kho, đậu hũ sốt cà nấm đông cô');
    const cat8 = new Category('cat-8', 'Điểm Tâm Sáng & Xôi Bánh', 'Clock', 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png', 8, 'Xôi xéo gà xé hành phi, bánh cuốn nóng, mì trộn cay xá xíu');
    const cat9 = new Category('cat-9', 'Lẩu Mini & Món Nướng', 'Flame', 'https://cdn-icons-png.flaticon.com/512/2515/2515183.png', 9, 'Lẩu thái tomyum 1 người, nem nướng Nha Trang, xiên que nướng');
    const cat10 = new Category('cat-10', 'Salad & Healthy Eat Clean', 'Salad', 'https://cdn-icons-png.flaticon.com/512/2515/2515261.png', 10, 'Salad ức gà áp chảo sốt mè rang, cơm gạo lứt teriyaki');

    this.categories.set(cat1.id, cat1);
    this.categories.set(cat2.id, cat2);
    this.categories.set(cat3.id, cat3);
    this.categories.set(cat4.id, cat4);
    this.categories.set(cat5.id, cat5);
    this.categories.set(cat6.id, cat6);
    this.categories.set(cat7.id, cat7);
    this.categories.set(cat8.id, cat8);
    this.categories.set(cat9.id, cat9);
    this.categories.set(cat10.id, cat10);

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

    // Seed OptionGroups (Quản lý luật & Tiêu đề nhóm)
    const grpSize: OptionGroup = {
      id: 'grp-size',
      canteenId: 'cant-a',
      name: 'Chọn kích cỡ',
      isRequired: true,
      minChoices: 1,
      maxChoices: 1,
    };
    const grpTopping: OptionGroup = {
      id: 'grp-topping',
      canteenId: 'cant-a',
      name: 'Món ăn kèm & Topping',
      isRequired: false,
      minChoices: 0,
      maxChoices: 3,
    };
    const grpSugar: OptionGroup = {
      id: 'grp-sugar',
      canteenId: 'cant-c',
      name: 'Mức đường',
      isRequired: true,
      minChoices: 1,
      maxChoices: 1,
    };
    const grpIce: OptionGroup = {
      id: 'grp-ice',
      canteenId: 'cant-c',
      name: 'Lượng đá',
      isRequired: true,
      minChoices: 1,
      maxChoices: 1,
    };

    this.optionGroups.set(grpSize.id, grpSize);
    this.optionGroups.set(grpTopping.id, grpTopping);
    this.optionGroups.set(grpSugar.id, grpSugar);
    this.optionGroups.set(grpIce.id, grpIce);

    // Tương thích thêm các mã id dạng opt-1, opt-2, opt-3, opt-4
    this.optionGroups.set('opt-1', { ...grpSize, id: 'opt-1' });
    this.optionGroups.set('opt-2', { ...grpTopping, id: 'opt-2' });
    this.optionGroups.set('opt-3', { ...grpSugar, id: 'opt-3' });
    this.optionGroups.set('opt-4', { ...grpIce, id: 'opt-4' });

    // Seed OptionItems (Các lựa chọn cụ thể có giá tiền)
    const seededOptionItems: OptionItem[] = [
      // Kích cỡ
      { id: 'opt-size-m', groupId: 'grp-size', name: 'Suất Vừa (Chuẩn)', price: 0, isAvailable: true },
      { id: 'opt-size-l', groupId: 'grp-size', name: 'Suất Lớn (Thêm Cơm & Đùi To)', price: 10000, isAvailable: true },
      { id: 'opt-item-1', groupId: 'grp-size', name: 'Suất Vừa (Chuẩn)', price: 0, isAvailable: true },
      { id: 'opt-item-2', groupId: 'grp-size', name: 'Suất Lớn (Thêm Cơm & Đùi To)', price: 10000, isAvailable: true },
      
      // Topping
      { id: 'opt-trungopla', groupId: 'grp-topping', name: 'Trứng ốp la lòng đào', price: 5000, isAvailable: true },
      { id: 'opt-canhrongbien', groupId: 'grp-topping', name: 'Canh rong biển thịt bằm', price: 5000, isAvailable: true },
      { id: 'opt-kimchi', groupId: 'grp-topping', name: 'Kim chi cay Hàn Quốc', price: 4000, isAvailable: true },
      { id: 'opt-tranchau', groupId: 'grp-topping', name: 'Trân châu đen', price: 5000, isAvailable: true },
      { id: 'opt-item-3', groupId: 'grp-topping', name: 'Trứng ốp la lòng đào', price: 5000, isAvailable: true },
      { id: 'opt-item-4', groupId: 'grp-topping', name: 'Canh rong biển thịt bằm', price: 5000, isAvailable: true },
      { id: 'opt-item-5', groupId: 'grp-topping', name: 'Kim chi cay Hàn Quốc', price: 4000, isAvailable: true },

      // Mức đường
      { id: 'opt-sugar-100', groupId: 'grp-sugar', name: '100% Đường (Chuẩn)', price: 0, isAvailable: true },
      { id: 'opt-sugar-70', groupId: 'grp-sugar', name: '70% Đường (Vừa)', price: 0, isAvailable: true },
      { id: 'opt-sugar-50', groupId: 'grp-sugar', name: '50% Đường (Ít ngọt)', price: 0, isAvailable: true },
      { id: 'opt-sugar-0', groupId: 'grp-sugar', name: 'Không đường', price: 0, isAvailable: true },
      { id: 'opt-item-6', groupId: 'grp-sugar', name: '100% Đường (Chuẩn)', price: 0, isAvailable: true },
      { id: 'opt-item-7', groupId: 'grp-sugar', name: '70% Đường (Vừa)', price: 0, isAvailable: true },
      { id: 'opt-item-8', groupId: 'grp-sugar', name: '50% Đường (Ít ngọt)', price: 0, isAvailable: true },
      { id: 'opt-item-9', groupId: 'grp-sugar', name: 'Không đường', price: 0, isAvailable: true },

      // Lượng đá
      { id: 'opt-ice-100', groupId: 'grp-ice', name: '100% Đá (Chuẩn)', price: 0, isAvailable: true },
      { id: 'opt-ice-50', groupId: 'grp-ice', name: '50% Đá', price: 0, isAvailable: true },
      { id: 'opt-ice-0', groupId: 'grp-ice', name: 'Không đá', price: 0, isAvailable: true },
      { id: 'opt-item-10', groupId: 'grp-ice', name: '100% Đá', price: 0, isAvailable: true },
      { id: 'opt-item-11', groupId: 'grp-ice', name: '50% Đá', price: 0, isAvailable: true },
      { id: 'opt-item-12', groupId: 'grp-ice', name: 'Không đá', price: 0, isAvailable: true },
    ];

    seededOptionItems.forEach((it) => this.optionItems.set(it.id, it));

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

    const prod6 = new Product(
      'prod-6',
      'Trà Sữa Trân Châu Đường Đen',
      25000,
      'cat-3',
      'cant-c',
      'https://images.unsplash.com/photo-1558857563-b37cf5a31a54?auto=format&fit=crop&q=80&w=600',
      4.8,
      290,
      5,
      true,
      {
        originalPrice: 32000,
        categoryName: 'Đồ Uống Giải Khát',
        canteenName: 'Căng tin C (Thư Viện)',
        description: 'Trà sữa đậm vị hồng trà Phúc Long, trân châu thủ công nấu đường đen dẻo thơm nức mũi.',
        isBestSeller: true,
        soldCount: 640,
      }
    );

    const prod7 = new Product(
      'prod-7',
      'Bún Chả Hà Nội Nướng Than',
      35000,
      'cat-2',
      'cant-a',
      'https://images.unsplash.com/photo-1503764654157-729106a23422?auto=format&fit=crop&q=80&w=600',
      4.8,
      175,
      10,
      true,
      {
        originalPrice: 40000,
        categoryName: 'Bún & Phở Nóng',
        canteenName: 'Căng tin A2',
        description: 'Chả miếng nướng vàng ươm thơm mùi than củi quyện nước chấm chua ngọt tỏi ớt đưa cơm.',
        soldCount: 290,
      }
    );

    const prod8 = new Product(
      'prod-8',
      'Khoai Tây Chiên Lắc Phô Mai',
      18000,
      'cat-4',
      'cant-c',
      'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600',
      4.7,
      195,
      7,
      true,
      {
        originalPrice: 22000,
        categoryName: 'Ăn Vặt & Bánh Mì',
        canteenName: 'Căng tin C (Thư Viện)',
        description: 'Khoai tây cắt que nhập khẩu chiên giòn tan, phủ lớp bột phô mai béo ngậy thơm nức.',
        soldCount: 410,
      }
    );

    const prod9 = new Product(
      'prod-9',
      'Mì Ý Sốt Bò Bằm Phô Mai',
      35000,
      'cat-5',
      'cant-c',
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
      4.8,
      160,
      12,
      true,
      {
        originalPrice: 42000,
        categoryName: 'Mì & Fast Food',
        canteenName: 'Căng tin C (Thư Viện)',
        description: 'Sợi mì spaghetti dai ngon quyện sốt cà chua thịt bò bằm đậm đà và phô mai Mozzarella kéo sợi.',
        soldCount: 210,
      }
    );

    const prod10 = new Product(
      'prod-10',
      'Cà Phê Muối Xứ Huế',
      18000,
      'cat-3',
      'cant-c',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      4.9,
      340,
      5,
      true,
      {
        originalPrice: 22000,
        categoryName: 'Đồ Uống Giải Khát',
        canteenName: 'Căng tin C (Thư Viện)',
        description: 'Cà phê Robusta Đắk Lắk pha phin nguyên chất kết hợp lớp kem mặn béo ngậy đặc trưng.',
        isBestSeller: true,
        soldCount: 590,
      }
    );

    const prod11 = new Product(
      'prod-11',
      'Bún Bò Huế Chả Cua Thịt Bắp',
      38000,
      'cat-2',
      'cant-b',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
      4.8,
      190,
      10,
      true,
      {
        originalPrice: 45000,
        categoryName: 'Bún & Phở Nóng',
        canteenName: 'Căng tin B (KTX)',
        description: 'Sợi bún to, thịt bắp bò hoa giòn sần sật, viên chả cua xứ Huế thơm nức mùi mắm ruốc.',
        soldCount: 280,
      }
    );

    const prod12 = new Product(
      'prod-12',
      'Cơm Rang Dưa Bò Giòn Rụm',
      35000,
      'cat-1',
      'cant-a',
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=600',
      4.8,
      230,
      10,
      true,
      {
        originalPrice: 40000,
        categoryName: 'Cơm Sinh Viên',
        canteenName: 'Căng tin A2',
        description: 'Hạt cơm đảo vàng ruộm xen lẫn cơm cháy giòn tan, thịt bò xào dưa chua ngấm gia vị cực ngon.',
        isBestSeller: true,
        soldCount: 370,
      }
    );

    this.products.set(prod1.id, prod1);
    this.products.set(prod2.id, prod2);
    this.products.set(prod3.id, prod3);
    this.products.set(prod4.id, prod4);
    this.products.set(prod5.id, prod5);
    this.products.set(prod6.id, prod6);
    this.products.set(prod7.id, prod7);
    this.products.set(prod8.id, prod8);
    this.products.set(prod9.id, prod9);
    this.products.set(prod10.id, prod10);
    this.products.set(prod11.id, prod11);
    this.products.set(prod12.id, prod12);

    // Seed Milk Teas & Specialized drinks in Campus Canteens
    const prodTS1 = new Product(
      'prod-ts-1',
      'Trà Sữa Hương Nhài Thanh Mát',
      28000,
      'cat-5',
      'cant-c',
      'https://images.unsplash.com/photo-1558857563-b37cf5a31a54?auto=format&fit=crop&q=80&w=600',
      4.8,
      85,
      5,
      true,
      {
        originalPrice: 35000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Vị trà nhài thanh khiết thơm ngát quyện cùng sữa tươi béo ngậy chuẩn vị sinh viên.',
        soldCount: 1700,
      }
    );
    const prodTS2 = new Product(
      'prod-ts-2',
      'Hồng Trà Sữa Ceylon Sương Sáo',
      28000,
      'cat-5',
      'cant-c',
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=600',
      4.7,
      64,
      5,
      true,
      {
        originalPrice: 35000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Hồng trà Ceylon đậm đà vị trà, thạch sương sáo thanh mát thơm béo ngậy.',
        soldCount: 1200,
      }
    );
    const prodTS3 = new Product(
      'prod-ts-3',
      'Trà Sữa Trân Châu Sợi Hoàng Kim',
      30000,
      'cat-5',
      'cant-c',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
      4.9,
      92,
      5,
      true,
      {
        originalPrice: 38000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Trà sữa kèm trân châu sợi dẻo dai hoàng kim tự nấu mỗi ngày.',
        soldCount: 1450,
      }
    );

    // Canteen B (Ký Túc Xá Sinh Viên)
    const prodTS4 = new Product(
      'prod-ts-4',
      'Trà Sữa Ba Anh Em Căng Tin B',
      30000,
      'cat-5',
      'cant-b',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
      4.8,
      96,
      5,
      true,
      {
        originalPrice: 38000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Topping khủng gồm thạch sương sáo, pudding trứng và trân châu sợi dẻo thơm.',
        soldCount: 1900,
      }
    );
    const prodTS5 = new Product(
      'prod-ts-5',
      'Trà Sữa Ô Long Nướng Kem Cheese',
      30000,
      'cat-5',
      'cant-b',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600',
      4.9,
      110,
      5,
      true,
      {
        originalPrice: 35000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Trà ô long sao nướng đậm vị, lớp kem cheese mặn béo ngậy phủ bên trên.',
        soldCount: 1650,
      }
    );
    const prodTS6 = new Product(
      'prod-ts-6',
      'Trà Sữa Trân Châu Hoàng Gia KTX',
      26000,
      'cat-5',
      'cant-b',
      'https://images.unsplash.com/photo-1558857563-b37cf5a31a54?auto=format&fit=crop&q=80&w=600',
      4.7,
      82,
      5,
      true,
      {
        originalPrice: 32000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Vị trà sữa truyền thống thơm ngon cùng hạt trân châu đen dẻo giòn.',
        soldCount: 1350,
      }
    );

    // Canteen A (Giảng Đường Trung Tâm)
    const prodTS7 = new Product(
      'prod-ts-7',
      'Matcha Vibe - Matcha Latte Sinh Viên 26K',
      26000,
      'cat-5',
      'cant-a',
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600',
      4.9,
      142,
      5,
      true,
      {
        originalPrice: 32000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Bột matcha Uji nguyên chất hòa quyện sữa tươi thanh trùng ngọt dịu giúp tỉnh táo học tập.',
        soldCount: 2200,
      }
    );
    const prodTS8 = new Product(
      'prod-ts-8',
      'Trà Sữa Nướng Vân Nam Hạt Sen Niêu Đất',
      30000,
      'cat-5',
      'cant-a',
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600',
      4.8,
      95,
      5,
      true,
      {
        originalPrice: 36000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Trà sữa ấm nướng trong niêu đất, hạt sen ninh mềm ngọt bùi thơm lừng mùa đông.',
        soldCount: 1100,
      }
    );

    // Cà phê sinh viên
    const prodCF1 = new Product(
      'prod-cf-1',
      'Cà Phê Muối Xứ Huế Béo Ngậy',
      20000,
      'cat-5',
      'cant-a',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
      4.9,
      165,
      4,
      true,
      {
        originalPrice: 25000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Cà phê pha phin truyền thống thơm đượm, lớp kem muối béo mặn mượt mà trên cùng.',
        soldCount: 1450,
      }
    );
    const prodCF2 = new Product(
      'prod-cf-2',
      'Bạc Xỉu Sữa Dừa 3 Tầng',
      22000,
      'cat-5',
      'cant-c',
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600',
      4.8,
      112,
      4,
      true,
      {
        originalPrice: 28000,
        categoryName: 'Trà Sữa & Cà Phê Sinh Viên',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Hòa quyện giữa sữa đặc, nước cốt dừa thơm lừng và cà phê espresso đậm đà.',
        soldCount: 980,
      }
    );

    // 6. Món Tráng Miệng & Chè (cat-6)
    const prodTM1 = new Product(
      'prod-tm-1',
      'Chè Dưỡng Nhan Tuyết Yến Hạt Sen',
      22000,
      'cat-6',
      'cant-b',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
      4.9,
      138,
      3,
      true,
      {
        originalPrice: 28000,
        categoryName: 'Món Tráng Miệng & Chè',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Chè dưỡng nhan thanh mát gồm tuyết yến, nhựa đào, hạt sen, táo đỏ và long nhãn bổ dưỡng.',
        soldCount: 890,
      }
    );
    const prodTM2 = new Product(
      'prod-tm-2',
      'Bánh Flan Caramen Cốt Dừa Thơm Béo',
      15000,
      'cat-6',
      'cant-a',
      'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&q=80&w=600',
      4.8,
      190,
      2,
      true,
      {
        originalPrice: 18000,
        categoryName: 'Món Tráng Miệng & Chè',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Trứng sữa mềm mịn tan trong miệng cùng nước cốt cà phê thơm lừng và nước cốt dừa béo ngọt.',
        soldCount: 1600,
      }
    );
    const prodTM3 = new Product(
      'prod-tm-3',
      'Sữa Chua Dẻo Trái Cây Tươi Cắt Lát',
      20000,
      'cat-6',
      'cant-c',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600',
      4.8,
      88,
      3,
      true,
      {
        originalPrice: 25000,
        categoryName: 'Món Tráng Miệng & Chè',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Sữa chua dẻo xắt hạt lựu ăn kèm dưa hấu, xoài, mít và sốt dâu tây ngọt thơm.',
        soldCount: 720,
      }
    );

    // 7. Món Chay Thanh Tịnh (cat-7)
    const prodCH1 = new Product(
      'prod-ch-1',
      'Cơm Chay Thập Cẩm Nấm Kho Tiêu',
      28000,
      'cat-7',
      'cant-a',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
      4.9,
      95,
      8,
      true,
      {
        originalPrice: 35000,
        categoryName: 'Món Chay Thanh Tịnh',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Cơm thơm dẻo ăn kèm nấm đùi gà kho tiêu, sườn non chay rim mắm ngọt và canh rong biển nấm.',
        soldCount: 840,
      }
    );
    const prodCH2 = new Product(
      'prod-ch-2',
      'Đậu Hũ Non Sốt Cà Nấm Đông Cô Chay',
      25000,
      'cat-7',
      'cant-c',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      4.8,
      76,
      7,
      true,
      {
        originalPrice: 30000,
        categoryName: 'Món Chay Thanh Tịnh',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Đậu hũ non mềm mịn sốt cà chua tươi và nấm đông cô giòn dai ngọt tự nhiên.',
        soldCount: 650,
      }
    );
    const prodCH3 = new Product(
      'prod-ch-3',
      'Hủ Tiếu Chay Tàu Hũ Rau Củ Ngọt Nước',
      28000,
      'cat-7',
      'cant-b',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
      4.7,
      63,
      8,
      true,
      {
        originalPrice: 32000,
        categoryName: 'Món Chay Thanh Tịnh',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Nước dùng ninh từ củ cải, bắp ngọt và nấm hương, ăn kèm chả lụa chay và tàu hũ ky chiên giòn.',
        soldCount: 510,
      }
    );

    // 8. Điểm Tâm Sáng & Xôi Bánh (cat-8)
    const prodDT1 = new Product(
      'prod-dt-1',
      'Xôi Xéo Gà Xé Hành Phi Đậu Xanh',
      25000,
      'cat-8',
      'cant-a',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600',
      4.9,
      215,
      5,
      true,
      {
        originalPrice: 30000,
        categoryName: 'Điểm Tâm Sáng & Xôi Bánh',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Xôi nếp cái hoa vàng dẻo thơm, xắt đậu xanh bùi béo, gà xé đậm đà và hành phi giòn rụm.',
        soldCount: 1980,
      }
    );
    const prodDT2 = new Product(
      'prod-dt-2',
      'Bánh Cuốn Nóng Thịt Mộc Nhĩ Chả Quế',
      25000,
      'cat-8',
      'cant-b',
      'https://images.unsplash.com/photo-1503764654157-729106a23422?auto=format&fit=crop&q=80&w=600',
      4.8,
      160,
      6,
      true,
      {
        originalPrice: 30000,
        categoryName: 'Điểm Tâm Sáng & Xôi Bánh',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Bánh tráng tay mỏng mướt tráng tại chỗ, nhân thịt băm mộc nhĩ thơm phức chấm nước mắm chua ngọt ấm nóng.',
        soldCount: 1420,
      }
    );
    const prodDT3 = new Product(
      'prod-dt-3',
      'Mì Trộn Cay Xá Xíu Trứng Lòng Đào',
      28000,
      'cat-8',
      'cant-b',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
      4.8,
      130,
      6,
      true,
      {
        originalPrice: 35000,
        categoryName: 'Điểm Tâm Sáng & Xôi Bánh',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Mì trứng dai ngon trộn sốt cay ngọt kiểu Hàn, xá xíu mềm thơm và quả trứng lòng đào béo ngậy.',
        soldCount: 1150,
      }
    );

    // 9. Lẩu Mini & Món Nướng (cat-9)
    const prodLN1 = new Product(
      'prod-ln-1',
      'Lẩu Thái Tomyum Mini 1 Người Bò Mỹ & Tôm',
      59000,
      'cat-9',
      'cant-a',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600',
      4.9,
      270,
      12,
      true,
      {
        originalPrice: 69000,
        categoryName: 'Lẩu Mini & Món Nướng',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Nước lẩu tomyum chua cay thơm mùi lá chanh sả, gồm ba chỉ bò Mỹ, tôm tươi, đậu hũ, rau nấm và vắt mì.',
        soldCount: 1560,
      }
    );
    const prodLN2 = new Product(
      'prod-ln-2',
      'Nem Nướng Nha Trang Cuộn Bánh Tráng',
      35000,
      'cat-9',
      'cant-b',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
      4.8,
      145,
      8,
      true,
      {
        originalPrice: 42000,
        categoryName: 'Lẩu Mini & Món Nướng',
        canteenName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
        description: 'Nem nướng vàng ươm thơm lừng, bánh tráng chiên giòn rụm, xoài dưa leo cuộn chấm tương nếp gan heo bí truyền.',
        soldCount: 1100,
      }
    );
    const prodLN3 = new Product(
      'prod-ln-3',
      'Combo 5 Xiên Que Nướng Sa Tế Mật Ong',
      25000,
      'cat-9',
      'cant-d',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
      4.7,
      120,
      7,
      true,
      {
        originalPrice: 30000,
        categoryName: 'Lẩu Mini & Món Nướng',
        canteenName: 'Căng Tin D - Khu Thể Thao & Sân Bóng',
        description: 'Thịt xiên nướng than hoa tẩm ướp sa tế mật ong cay ngọt đậm đà, lý tưởng ăn nhẹ sau buổi tập bóng.',
        soldCount: 940,
      }
    );

    // 10. Salad & Healthy Eat Clean (cat-10)
    const prodEC1 = new Product(
      'prod-ec-1',
      'Salad Ức Gà Áp Chảo Sốt Mè Rang',
      35000,
      'cat-10',
      'cant-c',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
      4.9,
      175,
      6,
      true,
      {
        originalPrice: 42000,
        categoryName: 'Salad & Healthy Eat Clean',
        canteenName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
        description: 'Ức gà mềm ướp thảo mộc áp chảo, xà lách tươi carot cà chua bi, trứng luộc và sốt mè rang Kewpie.',
        soldCount: 1320,
      }
    );
    const prodEC2 = new Product(
      'prod-ec-2',
      'Cơm Gạo Lứt Teriyaki Ức Gà & Bông Cải',
      38000,
      'cat-10',
      'cant-a',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      4.8,
      132,
      8,
      true,
      {
        originalPrice: 45000,
        categoryName: 'Salad & Healthy Eat Clean',
        canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
        description: 'Cơm gạo lứt huyết rồng dẻo thơm, ức gà sốt teriyaki đậm vị và rau củ hấp giàu chất xơ giữ dáng.',
        soldCount: 950,
      }
    );
    const prodEC3 = new Product(
      'prod-ec-3',
      'Salad Cá Ngừ Rong Biển Trứng Luộc',
      35000,
      'cat-10',
      'cant-d',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
      4.8,
      89,
      6,
      true,
      {
        originalPrice: 40000,
        categoryName: 'Salad & Healthy Eat Clean',
        canteenName: 'Căng Tin D - Khu Thể Thao & Sân Bóng',
        description: 'Cá ngừ ngâm dầu hảo hạng, rong biển wakame thanh mát, ngô ngọt và rau salad giòn tươi bổ sung protein.',
        soldCount: 780,
      }
    );

    // Save all to products map
    const allNewProducts = [
      prodTS1, prodTS2, prodTS3, prodTS4, prodTS5, prodTS6, prodTS7, prodTS8,
      prodCF1, prodCF2,
      prodTM1, prodTM2, prodTM3,
      prodCH1, prodCH2, prodCH3,
      prodDT1, prodDT2, prodDT3,
      prodLN1, prodLN2, prodLN3,
      prodEC1, prodEC2, prodEC3,
    ];
    allNewProducts.forEach((p) => this.products.set(p.id, p));

    // Seed the Campus Canteens in Database using Canteen Model
    const canteenA = new Canteen(
       'cant-a',
       'Căng Tin A - Giảng Đường Trung Tâm A2',
       'CTA',
       'Tầng 1 Tòa Giảng Đường A2 (Khu Trung Tâm)',
       'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
       {
         displayName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
         distance: '120m',
         duration: '10 phút',
         rating: 4.9,
         reviewCount: 320,
         soldCount: '3.5K+',
         voucher: '50.000đ',
         freeship: 'Freeship 10.000đ',
         isOpen: true,
         totalTables: 28,
         phone: '0988 123 456',
       }
     );

    const canteenB = new Canteen(
       'cant-b',
       'Căng Tin B - Ký Túc Xá Sinh Viên A1',
       'CTB',
       'Sảnh chính Ký Túc Xá A1 & B2',
       'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
       {
         displayName: 'Căng Tin B - Ký Túc Xá Sinh Viên A1',
         distance: '200m',
         duration: '12 phút',
         rating: 4.8,
         reviewCount: 285,
         soldCount: '2.9K+',
         voucher: '30.000đ',
         freeship: 'Freeship 10.000đ',
         isOpen: true,
         totalTables: 32,
         phone: '0988 654 321',
       }
     );

    const canteenC = new Canteen(
       'cant-c',
       'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
       'CTC',
       'Tầng trệt Tòa B4 (Khu Công Nghệ & Thư Viện)',
       'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
       {
         displayName: 'Căng Tin C - Khu Công Nghệ & Thư Viện B4',
         distance: '350m',
         duration: '15 phút',
         rating: 4.8,
         reviewCount: 215,
         soldCount: '2.4K+',
         voucher: '40.000đ',
         freeship: 'Freeship 10.000đ',
         isOpen: true,
         totalTables: 20,
         phone: '0988 777 888',
       }
     );

    const canteenD = new Canteen(
       'cant-d',
       'Căng Tin D - Khu Thể Thao & Sân Bóng',
       'CTD',
       'Nhà Thi Đấu Đa Năng Khu Liên Hợp Thể Thao',
       'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=600',
       {
         displayName: 'Căng Tin D - Khu Thể Thao & Sân Bóng',
         distance: '450m',
         duration: '18 phút',
         rating: 4.7,
         reviewCount: 160,
         soldCount: '1.8K+',
         voucher: '25.000đ',
         freeship: 'Freeship 10.000đ',
         isOpen: true,
         totalTables: 16,
         phone: '0988 555 666',
       }
     );

    this.canteens.set(canteenA.id, canteenA);
    this.canteens.set(canteenB.id, canteenB);
    this.canteens.set(canteenC.id, canteenC);
    this.canteens.set(canteenD.id, canteenD);

    // 4. Group 4: Cart & CartItem
    const cart1 = new Cart('cart-user-1', user1.id, 'cant-a', [
      new CartItem('ci-1', 'cart-user-1', prod1.id, prod1.name, prod1.image, prod1.price, 1, [
        {
          groupId: 'grp-topping',
          groupName: 'Món ăn kèm & Topping',
          optionId: 'opt-item-3',
          optionName: 'Trứng ốp la lòng đào',
          price: 5000,
          itemId: 'opt-item-3',
          itemName: 'Trứng ốp la lòng đào',
          extraPrice: 5000,
        },
      ], 'Làm giòn giúp mình'),
    ]);
    this.carts.set(cart1.userId, cart1);

    // 5. Group 5: Order, OrderDetail, Payment
    const od1 = new OrderDetail('od-1', 'ord-101', prod1.id, prod1.name, prod1.image, 40000, 1, [
      {
        groupId: 'grp-topping',
        groupName: 'Món ăn kèm & Topping',
        optionId: 'opt-item-3',
        optionName: 'Trứng ốp la lòng đào',
        price: 5000,
        itemId: 'opt-item-3',
        itemName: 'Trứng ốp la lòng đào',
        extraPrice: 5000,
      },
    ], 'Ăn tại bàn');
    const od2 = new OrderDetail('od-2', 'ord-101', prod5.id, prod5.name, prod5.image, 20000, 1, [
      {
        groupId: 'grp-sugar',
        groupName: 'Mức đường',
        optionId: 'opt-item-7',
        optionName: '70% Đường (Vừa)',
        price: 0,
        itemId: 'opt-item-7',
        itemName: '70% Đường (Vừa)',
        extraPrice: 0,
      },
    ]);

    // 5. Group 5: Orders & Payments
    // Đơn 1: Đang Nấu - Ăn tại bàn 02
    const order1 = new Order(
      'ord-101',
      'ORD-8291',
      user1.id,
      'Nguyễn Hữu Nam',
      user1.phone,
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [od1, od2],
      'DINE_IN',
      'CAMPUS_WALLET',
      {
        tableId: 'tbl-2',
        tableNumber: '12',
        discountAmount: 10000,
        status: 'PREPARING',
        isPaid: true,
        notes: 'Cho xin thêm 1 bát tương ớt và canh nóng',
        createdAt: new Date(Date.now() - 11 * 60 * 1000),
      }
    );
    this.orders.set(order1.id, order1);

    // Đơn 2: Đơn Mới - Ăn tại bàn 12
    const odKds1_1 = new OrderDetail('od-kds1-1', 'ord-9021', prod1.id, 'Cơm Gà Chiên Mắm Tỏi Giòn', prod1.image, 35000, 2, [
      { groupId: 'grp-sauce', groupName: 'Gia vị', optionId: 'opt-sauce-1', optionName: 'Nhiều sốt mắm tỏi', price: 0, itemName: 'Nhiều sốt mắm tỏi', extraPrice: 0 },
      { groupId: 'grp-egg', groupName: 'Thêm', optionId: 'opt-egg-1', optionName: 'Thêm trứng ốp la lòng đào', price: 5000, itemName: 'Thêm trứng ốp la lòng đào', extraPrice: 5000 },
      { groupId: 'grp-veg', groupName: 'Rau', optionId: 'opt-veg-1', optionName: 'Không ăn hành lá', price: 0, itemName: 'Không ăn hành lá', extraPrice: 0 },
    ]);
    const odKds1_2 = new OrderDetail('od-kds1-2', 'ord-9021', prod5.id, 'Trà Đào Cam Sả Tươi', prod5.image, 20000, 1, [
      { groupId: 'grp-sugar', groupName: 'Độ ngọt', optionId: 'opt-sugar-50', optionName: '50% Đường', price: 0, itemName: '50% Đường', extraPrice: 0 },
      { groupId: 'grp-ice', groupName: 'Lượng đá', optionId: 'opt-ice-more', optionName: 'Nhiều đá', price: 0, itemName: 'Nhiều đá', extraPrice: 0 },
    ]);
    const orderKds1 = new Order(
      'ord-9021',
      'ORD-9021',
      user2.id,
      'Nguyễn Văn Tuấn (CNTT K19)',
      '0981 123 456',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds1_1, odKds1_2],
      'DINE_IN',
      'MOMO',
      {
        tableNumber: '12',
        status: 'PENDING',
        isPaid: true,
        notes: 'Làm nhanh giúp em sắp vào ca học ạ!',
        createdAt: new Date(Date.now() - 2 * 60 * 1000),
      }
    );
    this.orders.set(orderKds1.id, orderKds1);

    // Đơn 3: Đơn Mới - Giao KTX B2
    const odKds2_1 = new OrderDetail('od-kds2-1', 'ord-9022', prod3.id, 'Phở Bò Tái Nạm Đặc Biệt', prod3.image, 38000, 1, [
      { groupId: 'grp-pho', groupName: 'Yêu cầu', optionId: 'opt-pho-1', optionName: 'Bò tái mềm, nước trong', price: 0, itemName: 'Bò tái mềm, nước trong', extraPrice: 0 },
      { groupId: 'grp-pho-2', groupName: 'Topping', optionId: 'opt-pho-quẩy', optionName: 'Thêm 2 quẩy giòn', price: 5000, itemName: 'Thêm 2 quẩy giòn', extraPrice: 5000 },
      { groupId: 'grp-veg', groupName: 'Rau', optionId: 'opt-veg-no-onion', optionName: 'Không hành tây', price: 0, itemName: 'Không hành tây', extraPrice: 0 },
    ]);
    const odKds2_2 = new OrderDetail('od-kds2-2', 'ord-9022', 'prod-ts-7', 'Matcha Latte Sinh Viên 26K', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600', 26000, 1, [
      { groupId: 'grp-ts', groupName: 'Topping', optionId: 'opt-ts-pud', optionName: 'Thêm thạch pudding trứng', price: 5000, itemName: 'Thêm thạch pudding trứng', extraPrice: 5000 },
      { groupId: 'grp-sugar', groupName: 'Đường', optionId: 'opt-sugar-30', optionName: '30% Ngọt nhẹ', price: 0, itemName: '30% Ngọt nhẹ', extraPrice: 0 },
    ]);
    const orderKds2 = new Order(
      'ord-9022',
      'ORD-9022',
      user1.id,
      'Lê Thị Thảo (Kinh Tế K20)',
      '0982 789 123',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds2_1, odKds2_2],
      'DELIVERY',
      'CAMPUS_WALLET',
      {
        deliveryAddressText: 'Phòng 405 KTX B2',
        status: 'PENDING',
        isPaid: true,
        notes: 'Mang lên tận cửa phòng giúp em nhé',
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      }
    );
    this.orders.set(orderKds2.id, orderKds2);

    // Đơn 4: Đơn Mới - Hẹn quầy lấy
    const odKds3_1 = new OrderDetail('od-kds3-1', 'ord-9023', prod4.id, 'Bánh Mì Thịt Nướng Sốt Cay', prod4.image, 22000, 2, [
      { groupId: 'grp-bm-1', groupName: 'Cay', optionId: 'opt-bm-spicy', optionName: 'Nhiều sốt cay', price: 0, itemName: 'Nhiều sốt cay', extraPrice: 0 },
      { groupId: 'grp-bm-2', groupName: 'Topping', optionId: 'opt-bm-pate', optionName: 'Thêm sốt pate cột đèn', price: 4000, itemName: 'Thêm sốt pate cột đèn', extraPrice: 4000 },
    ]);
    const orderKds3 = new Order(
      'ord-9023',
      'ORD-9023',
      user2.id,
      'Trần Minh Quân (Cơ Khí K18)',
      '0983 555 777',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds3_1],
      'TAKEAWAY',
      'VNPAY',
      {
        status: 'PENDING',
        isPaid: true,
        notes: 'Bọc giấy bạc giữ nóng giùm',
        createdAt: new Date(Date.now() - 7 * 60 * 1000),
      }
    );
    this.orders.set(orderKds3.id, orderKds3);

    // Đơn 5: Đang Nấu - Hẹn quầy lấy
    const odKds4_1 = new OrderDetail('od-kds4-1', 'ord-9019', prod2.id, 'Bún Chả Hà Nội Nướng Than', prod2.image, 35000, 1, [
      { groupId: 'grp-bc', groupName: 'Gia vị', optionId: 'opt-bc-garlic', optionName: 'Nhiều tỏi ớt ngâm', price: 0, itemName: 'Nhiều tỏi ớt ngâm', extraPrice: 0 },
      { groupId: 'grp-bc-nem', groupName: 'Thêm', optionId: 'opt-bc-nem', optionName: 'Thêm 1 nem rán', price: 8000, itemName: 'Thêm 1 nem rán', extraPrice: 8000 },
    ]);
    const orderKds4 = new Order(
      'ord-9019',
      'ORD-9019',
      user1.id,
      'Hoàng Mai Linh (Ngoại Ngữ)',
      '0984 666 888',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds4_1],
      'TAKEAWAY',
      'MOMO',
      {
        status: 'PREPARING',
        isPaid: true,
        notes: 'Đầy đủ rau sống kinh giới tía tô',
        createdAt: new Date(Date.now() - 14 * 60 * 1000),
      }
    );
    this.orders.set(orderKds4.id, orderKds4);

    // Đơn 6: Chờ Giao/Nhận - Ăn tại bàn 07
    const odKds5_1 = new OrderDetail('od-kds5-1', 'ord-9015', prod1.id, 'Cơm Gà Chiên Mắm Tỏi Giòn', prod1.image, 35000, 1, [
      { groupId: 'grp-sauce', groupName: 'Gia vị', optionId: 'opt-sauce-1', optionName: 'Đậm đà sốt tỏi', price: 0, itemName: 'Đậm đà sốt tỏi', extraPrice: 0 },
    ]);
    const orderKds5 = new Order(
      'ord-9015',
      'ORD-9015',
      user2.id,
      'Phạm Hải Đăng (Điện Tử K19)',
      '0985 999 000',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds5_1],
      'DINE_IN',
      'CAMPUS_WALLET',
      {
        tableNumber: '07',
        status: 'READY',
        isPaid: true,
        createdAt: new Date(Date.now() - 19 * 60 * 1000),
      }
    );
    this.orders.set(orderKds5.id, orderKds5);

    // Đơn 7: Chờ Giao/Nhận - Giao KTX A1
    const odKds6_1 = new OrderDetail('od-kds6-1', 'ord-9012', prod3.id, 'Phở Bò Tái Nạm Đặc Biệt', prod3.image, 38000, 2, [
      { groupId: 'grp-soup', groupName: 'Nước dùng', optionId: 'opt-soup-hot', optionName: 'Nước dùng thật sôi nóng', price: 0, itemName: 'Nước dùng thật sôi nóng', extraPrice: 0 },
      { groupId: 'grp-chili', groupName: 'Gia vị', optionId: 'opt-chili', optionName: 'Lấy thêm ớt tươi và chanh', price: 0, itemName: 'Lấy thêm ớt tươi và chanh', extraPrice: 0 },
    ]);
    const orderKds6 = new Order(
      'ord-9012',
      'ORD-9012',
      user1.id,
      'Đỗ Bích Phương (Quản Trị K20)',
      '0986 333 444',
      'cant-a',
      'Căng Tin A - Giảng Đường Trung Tâm A2',
      [odKds6_1],
      'DELIVERY',
      'VNPAY',
      {
        deliveryAddressText: 'Phòng 214 KTX A1',
        status: 'READY',
        isPaid: true,
        notes: 'Đến cổng KTX gọi em xuống nhận ạ',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      }
    );
    this.orders.set(orderKds6.id, orderKds6);

    const payment1 = new Payment('pay-1', order1.id, user1.id, order1.finalAmount, 'CAMPUS_WALLET', 'SUCCESS', 'TX-CAMPUS-99120', {
      paidAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    this.orders.set(order1.id, order1);
    this.payments.set(payment1.id, payment1);

    // Đơn hàng đã hoàn thành (COMPLETED) của user1 (Cơm Gà Chiên Mắm) để có đánh giá hợp lệ
    const odCompleted1 = new OrderDetail('od-c1', 'ord-completed-1', prod1.id, prod1.name, prod1.image, 35000, 1);
    const orderCompleted1 = new Order(
      'ord-completed-1',
      'ORD-8280',
      user1.id,
      user1.name,
      user1.phone,
      'cant-a',
      'Căng tin A2',
      [odCompleted1],
      'DINE_IN',
      'CAMPUS_WALLET',
      {
        status: 'COMPLETED',
        isPaid: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000),
      }
    );
    this.orders.set(orderCompleted1.id, orderCompleted1);

    // Đơn hàng đã hoàn thành (COMPLETED) của user2 (Trà Đào)
    const odCompleted2 = new OrderDetail('od-c2', 'ord-completed-2', prod5.id, prod5.name, prod5.image, 20000, 1);
    const orderCompleted2 = new Order(
      'ord-completed-2',
      'ORD-8281',
      user2.id,
      user2.name,
      user2.phone,
      'cant-a',
      'Căng tin A2',
      [odCompleted2],
      'TAKEAWAY',
      'MOMO',
      {
        status: 'COMPLETED',
        isPaid: true,
        createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      }
    );
    this.orders.set(orderCompleted2.id, orderCompleted2);

    // 6. Group 6: Marketing (Banner, FlashSale, Voucher)
    const b1 = new Banner('ban-1', 'Combo Cơm Gà Chiên Mắm Tỏi', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200', 1, true, {
      subtitle: 'TẶNG NGAY 1 Trà Đào Sảng Khoái khi đặt combo trưa',
      targetType: 'PRODUCT',
      targetId: 'prod-1',
    });
    const b2 = new Banner('ban-2', 'Đồng Giá 19.000đ Bún & Phở Nóng', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=1200', 2, true, {
      subtitle: 'Giảm tới 45% khung giờ vàng 11h30 - 13h30 tại Căng tin B',
      targetType: 'CATEGORY',
      targetId: 'cat-2',
    });
    const b3 = new Banner('ban-3', 'Giao Hàng 0 Đồng Tận Phòng KTX', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=1200', 3, true, {
      subtitle: 'Nhập mã FREESHIPKTX - Đội shipper sinh viên giao 15 phút',
      targetType: 'CATEGORY',
      targetId: 'cat-1',
    });
    const b4 = new Banner('ban-4', 'Bữa Tối Sinh Viên Chỉ 29.000đ', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=1200', 4, true, {
      subtitle: 'Cơm Tấm Sườn Bì + Canh + Trà Đá cho mùa thi',
      targetType: 'PRODUCT',
      targetId: 'prod-2',
    });
    this.banners.set(b1.id, b1);
    this.banners.set(b2.id, b2);
    this.banners.set(b3.id, b3);
    this.banners.set(b4.id, b4);

    const fs1 = new FlashSale(
      'fs-1',
      'Flash Sale Giờ Vàng Cơm Gà',
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
      52,
      new Date(Date.now() - 10 * 60 * 1000),
      new Date(Date.now() + 3 * 3600 * 1000),
      true,
      'Chỉ 15K ly trà đào khổng lồ'
    );
    const fs3 = new FlashSale(
      'fs-3',
      'Phở Bò Tái Lăn Ưu Đãi Đậm',
      prod3.id,
      prod3.name,
      prod3.image,
      42000,
      26000,
      60,
      35,
      new Date(Date.now() - 15 * 60 * 1000),
      new Date(Date.now() + 2 * 3600 * 1000),
      true,
      'Tô phở nóng hổi nước dùng hầm 12h thơm lừng'
    );
    const fs4 = new FlashSale(
      'fs-4',
      'Trà Sữa Trân Châu Giờ Nghỉ',
      prod6.id,
      prod6.name,
      prod6.image,
      32000,
      19000,
      90,
      61,
      new Date(Date.now() - 20 * 60 * 1000),
      new Date(Date.now() + 4 * 3600 * 1000),
      true,
      'Trân châu đường đen dẻo quánh sữa tươi béo ngậy'
    );
    this.flashSales.set(fs1.id, fs1);
    this.flashSales.set(fs2.id, fs2);
    this.flashSales.set(fs3.id, fs3);
    this.flashSales.set(fs4.id, fs4);

    const v1 = new Voucher('vouch-1', 'KHAIGIANG20', 'Giảm 20% Chào Kỳ Mới', 'Giảm 20% tối đa 15K cho đơn từ 35.000đ', 'PERCENTAGE', 20, 35000, {
      maxDiscount: 15000,
      usageLimit: 500,
      usedCount: 124,
    });
    const v2 = new Voucher('vouch-2', 'FREESHIPKTX', 'Miễn Phí Giao KTX', 'Giảm 10.000đ phí giao hàng tới KTX A, B', 'FIXED', 10000, 30000, {
      usageLimit: 1000,
      usedCount: 310,
    });
    const v3 = new Voucher('vouch-3', 'COMBO29K', 'Ưu Đãi Bữa Tối 29K', 'Giảm trực tiếp 9.000đ khi đặt combo cơm tấm', 'FIXED', 9000, 38000, {
      usageLimit: 300,
      usedCount: 89,
    });
    const v4 = new Voucher('vouch-4', 'UNIEAT50', 'Giảm 50% Món Thứ Hai', 'Giảm 50% tối đa 20.000đ cho đơn từ 60.000đ', 'PERCENTAGE', 50, 60000, {
      maxDiscount: 20000,
      usageLimit: 200,
      usedCount: 45,
    });
    this.vouchers.set(v1.id, v1);
    this.vouchers.set(v2.id, v2);
    this.vouchers.set(v3.id, v3);
    this.vouchers.set(v4.id, v4);

    // 7. Group 7: Reviews & Notifications
    const r1 = new Review('rev-1', user1.id, user1.name, 'PRODUCT', prod1.id, 5, 'Đùi gà giòn rụm, xốt mắm thơm phức, ăn kèm dưa chuột rất vừa miệng!', {
      orderId: orderCompleted1.id,
      userRole: 'Sinh viên năm 3 • CNTT',
      helpfulCount: 18,
    });
    const r2 = new Review('rev-2', user2.id, user2.name, 'PRODUCT', prod5.id, 5, 'Trà đào vị thanh mát sảng khoái, nhiều đào giòn sần sật, ly to đùng!', {
      orderId: orderCompleted2.id,
      userRole: 'Sinh viên năm 2 • Kinh tế',
      helpfulCount: 11,
    });
    this.reviews.set(r1.id, r1);
    this.reviews.set(r2.id, r2);

    const n1 = new Notification('notif-1', user1.id, 'Đơn hàng đang chuẩn bị', 'Bếp đang làm món Cơm Gà của bạn tại Căng tin A2. Dự kiến hoàn thành trong 8 phút nữa.', 'ORDER_STATUS', order1.id, false);
    const n2 = new Notification('notif-2', 'ALL', 'Khai giảng kỳ mới: Nạp ví tặng 10%', 'Nạp tiền vào ví sinh viên qua MoMo/ZaloPay tặng ngay 10% giá trị nạp trong tuần này!', 'PROMOTION', undefined, false);
    this.notifications.set(n1.id, n1);
    this.notifications.set(n2.id, n2);

    // 8. Group 8: Search History (Lịch sử tìm kiếm sinh viên từ backend)
    const initialSearches = [
      'Matcha Latte 26K',
      'Trà sữa trân châu',
      'Cơm gà chiên mắm',
      'Bún chả Hà Nội',
      'Bánh mì thịt nướng',
      'Chè dưỡng nhan',
    ];
    initialSearches.forEach((query, idx) => {
      const sh = new SearchHistoryItem(`sh-${idx + 1}`, query, 'user-guest', new Date(Date.now() - idx * 60000).toISOString());
      this.searchHistories.set(sh.id, sh);
    });
  }
}

export const db = DatabaseService.getInstance();
