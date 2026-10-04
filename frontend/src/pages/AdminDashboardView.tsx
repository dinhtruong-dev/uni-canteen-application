import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import {
  ShieldAlert,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Ban,
  Wallet,
  Sparkles,
  BarChart3,
  Clock,
  Phone,
  Power,
  ChevronRight,
  UserCheck,
  UserX,
  Utensils,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Star,
  Leaf,
  AlertCircle,
  Filter,
  Menu,
  ChevronDown,
  QrCode,
} from 'lucide-react';
import { AdminTablesView } from './admin/AdminTablesView';

export const AdminDashboardView: React.FC = () => {
  const {
    currentView,
    users,
    canteens,
    toggleCanteenStatus,
    orders,
    foods,
    addFood,
    updateFood,
    toggleFoodAvailability,
    deleteFood,
    promotions,
    categories,
    topUpWallet,
    showToast,
  } = useApp();

  const activeCategories = categories;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'CANTEENS' | 'FOODS' | 'PROMOS' | 'TABLES'>('OVERVIEW');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  // Users Tab States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [grantAmount, setGrantAmount] = useState<number>(50000);

  // Foods Tab States
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCanteenFilter, setFoodCanteenFilter] = useState<string>('ALL');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('ALL');
  const [foodStatusFilter, setFoodStatusFilter] = useState<string>('ALL');

  // Food Modal States
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Food Form Fields
  const [formName, setFormName] = useState('');
  const [formCanteenId, setFormCanteenId] = useState(canteens[0]?.id || 'cant-a');
  const [formCategoryId, setFormCategoryId] = useState('cat-1');
  const [formPrice, setFormPrice] = useState<number>(35000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | ''>(40000);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formPrepTime, setFormPrepTime] = useState<number>(10);
  const [formIsVegetarian, setFormIsVegetarian] = useState(false);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Derived statistics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'CANCELLED' ? sum + o.totalAmount : sum), 0);
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const activeOrdersCount = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;
  const totalStudents = users.filter((u) => u.role === 'STUDENT').length;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.studentId && u.studentId.includes(userSearch));
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Filtered Foods
  const filteredFoods = foods.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.description.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.canteenName.toLowerCase().includes(foodSearch.toLowerCase());
    const matchCanteen = foodCanteenFilter === 'ALL' || f.canteenId === foodCanteenFilter;
    const matchCategory = foodCategoryFilter === 'ALL' || f.categoryId === foodCategoryFilter;
    const matchStatus =
      foodStatusFilter === 'ALL' ||
      (foodStatusFilter === 'AVAILABLE' && f.isAvailable) ||
      (foodStatusFilter === 'UNAVAILABLE' && !f.isAvailable);

    return matchSearch && matchCanteen && matchCategory && matchStatus;
  });

  const handleGrantCredit = (userId: string) => {
    topUpWallet(grantAmount, 'Cấp vốn hỗ trợ từ Admin');
    showToast(`Đã cấp +${grantAmount.toLocaleString('vi-VN')}đ vào Ví cho tài khoản này!`, 'success');
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingFood(null);
    setFormName('');
    setFormCanteenId(canteens[0]?.id || 'cant-a');
    setFormCategoryId('cat-1');
    setFormPrice(35000);
    setFormOriginalPrice(40000);
    setFormImage('https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600');
    setFormDescription('Được chế biến tươi ngon trong ngày tại quầy căng tin, đảm bảo an toàn vệ sinh thực phẩm.');
    setFormIngredients('Gạo tươi, thịt nạc, gia vị chuẩn vị');
    setFormPrepTime(10);
    setFormIsVegetarian(false);
    setFormIsBestSeller(false);
    setFormIsAvailable(true);
    setIsFoodModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFormName(food.name);
    setFormCanteenId(food.canteenId);
    setFormCategoryId(food.categoryId);
    setFormPrice(food.price);
    setFormOriginalPrice(food.originalPrice || '');
    setFormImage(food.image);
    setFormDescription(food.description || '');
    setFormIngredients(Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients || '');
    setFormPrepTime(food.preparationTime || 10);
    setFormIsVegetarian(!!food.isVegetarian);
    setFormIsBestSeller(!!food.isBestSeller);
    setFormIsAvailable(food.isAvailable);
    setIsFoodModalOpen(true);
  };

  // Save Food Handler (Add / Edit)
  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Vui lòng nhập tên món ăn!', 'error');
      return;
    }

    if (formPrice <= 0) {
      showToast('Giá món ăn phải lớn hơn 0đ!', 'error');
      return;
    }

    const matchedCanteen = canteens.find((c) => c.id === formCanteenId);
    const matchedCategory = activeCategories.find((cat) => cat.id === formCategoryId);

    const ingredientsArray = formIngredients
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const foodData = {
      name: formName.trim(),
      canteenId: formCanteenId,
      canteenName: matchedCanteen ? matchedCanteen.name : 'Căng tin Campus',
      categoryId: formCategoryId,
      categoryName: matchedCategory ? matchedCategory.name : 'Đồ Ăn',
      price: Number(formPrice),
      originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
      image: formImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
      description: formDescription.trim(),
      ingredients: ingredientsArray,
      preparationTime: Number(formPrepTime) || 10,
      isVegetarian: formIsVegetarian,
      isBestSeller: formIsBestSeller,
      isAvailable: formIsAvailable,
    };

    if (editingFood) {
      updateFood(editingFood.id, foodData);
    } else {
      addFood(foodData);
    }

    setIsFoodModalOpen(false);
  };

  // Delete Food Handler
  const handleDeleteFood = (food: FoodItem) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA món "${food.name}" khỏi menu toàn trường?`)) {
      deleteFood(food.id);
    }
  };

  // Preset Image Picker Options
  const imagePresets = [
    { label: 'Cơm Gà', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600' },
    { label: 'Cơm Tấm', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Phở Bò', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=600' },
    { label: 'Mì Ý', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600' },
    { label: 'Bánh Mì / Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600' },
    { label: 'Trà Sữa / Đồ Uống', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Món Chay / Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/30 border border-purple-400/30 text-purple-300 flex items-center justify-center font-bold text-xl shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-purple-300 font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> QUẢN TRỊ TRUNG TÂM UNIEAT CAMPUS
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Thống Kê & Phân Quyền Hệ Thống</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs bg-purple-950/60 p-3 rounded-2xl border border-purple-800/50 backdrop-blur-xs">
              <p className="text-purple-300 font-medium">Tổng Doanh Thu Căng Tin</p>
              <p className="text-xl font-black text-amber-400 font-mono">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        {/* Hamburger Menu & Current Active Section Bar */}
        <div className="mt-5 pt-4 border-t border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Hamburger Menu Button */}
          <div className="relative">
            <button
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5 text-amber-400" />
              <span>Menu Chức Năng Admin</span>
              <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Overlay */}
            {isAdminMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsAdminMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 z-40 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-extrabold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Chọn chức năng quản trị</span>
                    <button onClick={() => setIsAdminMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => { setActiveTab('OVERVIEW'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'OVERVIEW'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-purple-300" />
                      <span>Tổng Quan System</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => { setActiveTab('FOODS'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'FOODS'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-amber-400" />
                      <span>Quản Lý Món Ăn</span>
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {foods.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('USERS'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'USERS'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Sinh Viên & Nhân Viên</span>
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {users.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('CANTEENS'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'CANTEENS'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Quản Lý Căng Tin</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {canteens.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('PROMOS'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'PROMOS'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Ticket className="w-4 h-4 text-orange-400" />
                      <span>Mã Giảm Giá Khuyến Mãi</span>
                    </span>
                    <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      {promotions.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('TABLES'); setIsAdminMenuOpen(false); }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-colors text-xs font-bold cursor-pointer ${
                      activeTab === 'TABLES'
                        ? 'bg-purple-600 text-white font-black'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Quản Lý Bàn Ăn & Quét QR</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
                      MySQL
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Active section badge indicator */}
          <div className="flex items-center gap-2">
            <span className="text-purple-300 font-medium">Mục hiện tại:</span>
            <span className="bg-purple-500/30 border border-purple-400/40 text-purple-200 px-3.5 py-1.5 rounded-xl font-extrabold flex items-center gap-2 shadow-inner">
              {activeTab === 'OVERVIEW' && <BarChart3 className="w-4 h-4 text-purple-300" />}
              {activeTab === 'FOODS' && <Utensils className="w-4 h-4 text-amber-300" />}
              {activeTab === 'USERS' && <Users className="w-4 h-4 text-blue-300" />}
              {activeTab === 'CANTEENS' && <Building2 className="w-4 h-4 text-emerald-300" />}
              {activeTab === 'PROMOS' && <Ticket className="w-4 h-4 text-orange-300" />}
              {activeTab === 'TABLES' && <QrCode className="w-4 h-4 text-emerald-300" />}
              
              {activeTab === 'OVERVIEW' && 'Tổng Quan System'}
              {activeTab === 'FOODS' && `Thực Đơn Món Ăn (${foods.length} món)`}
              {activeTab === 'USERS' && `Sinh Viên & Nhân Viên (${users.length} tài khoản)`}
              {activeTab === 'CANTEENS' && `Quầy Căng Tin (${canteens.length} quầy)`}
              {activeTab === 'PROMOS' && 'Mã Giảm Giá Khuyến Mãi'}
              {activeTab === 'TABLES' && 'Quản Lý Bàn Ăn & Quét Mã QR (MySQL CSDL)'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab 1: System Overview KPI Cards */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Doanh Thu Toàn Trường</span>
                <DollarSign className="w-5 h-5 bg-emerald-100 p-1 rounded-lg" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% so với tuần trước
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tổng Số Đơn Hàng</span>
                <ShoppingBag className="w-5 h-5 bg-blue-100 p-1 rounded-lg" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{totalOrdersCount} đơn</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {completedOrdersCount} xong • {activeOrdersCount} đang xử lý
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tài Khoản Sinh Viên</span>
                <Users className="w-5 h-5 bg-purple-100 p-1 rounded-lg" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{totalStudents} tài khoản</p>
              <p className="text-[11px] text-purple-600 font-semibold">100% tài khoản đã xác thực MSSV</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-orange-600">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Căng Tin Hoạt Động</span>
                <Building2 className="w-5 h-5 bg-orange-100 p-1 rounded-lg" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {canteens.filter((c) => c.isOpen).length} / {canteens.length}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">Sẵn sàng phục vụ giờ trưa</p>
            </div>
          </div>

          {/* Top Selling Foods Table & Canteen Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Món Ăn Bán Chạy Nhất Toàn Trường
              </h3>

              <div className="space-y-3 divide-y divide-slate-100">
                {foods.slice(0, 5).map((food, idx) => (
                  <div key={food.id} className="pt-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <img src={food.image} alt={food.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{food.name}</p>
                        <p className="text-slate-500 text-[11px]">{food.canteenName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-orange-600 block">
                        {food.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ★ {food.rating} ({food.reviewCount} đánh giá)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canteen Revenue Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Doanh Số Theo Quầy Căng Tin
              </h3>

              <div className="space-y-4">
                {canteens.map((cant) => {
                  const cantOrders = orders.filter((o) => o.canteenId === cant.id && o.status !== 'CANCELLED');
                  const cantRev = cantOrders.reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <div key={cant.id} className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${cant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {cant.name}
                        </span>
                        <span className="text-orange-600 font-mono">{cantRev.toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (cantRev / (totalRevenue || 1)) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{cantOrders.length} đơn hoàn thành</span>
                        <span>Sức chứa: {cant.totalTables} bàn</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Food Management (Thêm, Sửa, Xóa Món Ăn) */}
      {activeTab === 'FOODS' && (
        <div className="space-y-6">
          {/* Header Controls & Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-orange-500" />
                  Quản Lý Thực Đơn Món Ăn Toàn Trường
                </h2>
                <p className="text-xs text-slate-500">Thêm món ăn mới, chỉnh sửa giá cả, cập nhật trạng thái còn/hết hàng hoặc xóa món</p>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Thêm Món Ăn Mới
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  placeholder="Tìm món ăn, mô tả..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-transparent focus:border-orange-500 rounded-xl text-xs font-medium outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>

              <select
                value={foodCanteenFilter}
                onChange={(e) => setFoodCanteenFilter(e.target.value)}
                className="bg-slate-100 border border-transparent focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="ALL">Tất cả Căng Tin ({canteens.length})</option>
                {canteens.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={foodCategoryFilter}
                onChange={(e) => setFoodCategoryFilter(e.target.value)}
                className="bg-slate-100 border border-transparent focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="ALL">Tất cả Danh Mục</option>
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={foodStatusFilter}
                onChange={(e) => setFoodStatusFilter(e.target.value)}
                className="bg-slate-100 border border-transparent focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-hidden"
              >
                <option value="ALL">Tất cả Trạng Thái</option>
                <option value="AVAILABLE">Đang Phục Vụ (Còn Hàng)</option>
                <option value="UNAVAILABLE">Tạm Hết Hàng</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tổng số món</p>
                <p className="text-xl font-black text-slate-900 font-mono">{foods.length}</p>
              </div>
              <Utensils className="w-8 h-8 text-orange-200" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Đang phục vụ</p>
                <p className="text-xl font-black text-emerald-600 font-mono">
                  {foods.filter((f) => f.isAvailable).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tạm hết hàng</p>
                <p className="text-xl font-black text-rose-600 font-mono">
                  {foods.filter((f) => !f.isAvailable).length}
                </p>
              </div>
              <Ban className="w-8 h-8 text-rose-200" />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Best Sellers</p>
                <p className="text-xl font-black text-amber-500 font-mono">
                  {foods.filter((f) => f.isBestSeller).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-amber-200 fill-amber-200" />
            </div>
          </div>

          {/* Food Cards Grid */}
          {filteredFoods.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
              <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">Không tìm thấy món ăn nào phù hợp!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc Căng Tin / Danh Mục để xem toàn bộ danh sách.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    food.isAvailable
                      ? 'border-slate-200/80 shadow-xs hover:border-orange-300 hover:shadow-md'
                      : 'border-slate-200 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div>
                    {/* Thumbnail Image Header */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                        <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                          {food.categoryName}
                        </span>

                        <div className="flex items-center gap-1">
                          {food.isBestSeller && (
                            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                              <Star className="w-3 h-3 fill-white" /> BEST SELLER
                            </span>
                          )}
                          {food.isVegetarian && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Leaf className="w-3 h-3" /> CHAY
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Canteen info */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[11px] font-semibold text-orange-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {food.canteenName}
                        </p>
                      </div>
                    </div>

                    {/* Food Info Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1">
                            {food.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {food.description || 'Không có mô tả'}
                        </p>
                      </div>

                      {/* Price & Rating */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-lg font-black text-orange-600 font-mono">
                            {food.price.toLocaleString('vi-VN')}đ
                          </span>
                          {food.originalPrice && food.originalPrice > food.price && (
                            <span className="text-xs text-slate-400 line-through font-mono ml-2">
                              {food.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {food.rating} <span className="text-[10px] text-slate-400 font-normal">({food.reviewCount})</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 justify-end mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" /> ~{food.preparationTime || 10} phút
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Toggle Availability */}
                    <button
                      onClick={() => toggleFoodAvailability(food.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        food.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{food.isAvailable ? 'Còn Hàng' : 'Tạm Hết'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(food)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa món ăn"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteFood(food)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Xóa món ăn khỏi thực đơn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Users Management */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-slate-900 text-lg">Quản Lý Danh Sách Người Dùng</h2>
              <p className="text-xs text-slate-500">Tìm kiếm, kiểm tra MSSV, cộng tiền học bổng ví hoặc khóa tài khoản</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm theo tên, email, MSSV..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent focus:border-purple-500 rounded-xl text-xs font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-100 border border-transparent rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="STUDENT">Sinh viên</option>
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                  <th className="py-3 px-3">Người dùng</th>
                  <th className="py-3 px-3">Vai trò / MSSV</th>
                  <th className="py-3 px-3">Khoa / Lớp</th>
                  <th className="py-3 px-3">Số dư Ví</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        u.role === 'STUDENT'
                          ? 'bg-orange-100 text-orange-800'
                          : u.role === 'STAFF'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {u.role === 'STUDENT' ? `SV: ${u.studentId || 'N/A'}` : u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600">
                      {u.department ? `${u.department} (${u.className || ''})` : '--'}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {(u.walletBalance || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                        u.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {u.status === 'ACTIVE' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleGrantCredit(u.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Tặng credit vào Ví Sinh Viên"
                        >
                          <Wallet className="w-3 h-3" /> +50k Ví
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Canteen Management */}
      {activeTab === 'CANTEENS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {canteens.map((cant) => (
            <div key={cant.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
              <div className="relative h-40">
                <img src={cant.image} alt={cant.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    cant.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {cant.isOpen ? 'Đang Mở Cửa' : 'Đóng Cửa'}
                  </span>
                  <h3 className="font-extrabold text-base mt-1 leading-tight">{cant.name}</h3>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3 text-xs">
                <p className="text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{cant.location}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Giờ mở cửa: {cant.openingHours}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hotline quầy: {cant.phone}</span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Tổng số bàn QR: {cant.totalTables}</span>
                  <button
                    onClick={() => toggleCanteenStatus(cant.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      cant.isOpen
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {cant.isOpen ? 'Tạm Đóng Quầy' : 'Mở Cửa Phục Vụ'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Promotions Management */}
      {activeTab === 'PROMOS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-lg">Mã Giảm Giá Khuyến Mãi UniEat</h2>
              <p className="text-xs text-slate-500">Quản lý các mã coupon giảm giá cho sinh viên trong trường</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-dashed border-orange-300 rounded-3xl p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-lg text-orange-600 bg-white px-3 py-1 rounded-xl shadow-xs border border-orange-200">
                    {promo.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {promo.discountType === 'PERCENT' ? `-${promo.discountValue}%` : `-${promo.discountValue.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{promo.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{promo.description}</p>
                </div>

                <div className="pt-2 border-t border-orange-200/60 text-[11px] text-slate-500 flex items-center justify-between font-semibold">
                  <span>Đơn tối thiểu: {promo.minOrderValue.toLocaleString('vi-VN')}đ</span>
                  <span>Đã dùng: {promo.usedCount}/{promo.usageLimit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Food Item */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/30 border border-orange-400/30 text-orange-400 flex items-center justify-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {editingFood ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới VÀO MENU'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    {editingFood ? `Mã món: ${editingFood.id}` : 'Thêm món ăn hấp dẫn vào thực đơn căng tin sinh viên'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFood} className="p-6 space-y-5 text-xs text-slate-800 max-h-[80vh] overflow-y-auto">
              {/* Row 1: Tên món ăn & Căng Tin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    Tên Món Ăn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Cơm Bò Sốt Tiêu Đen..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-bold text-slate-900 outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    Thuộc Căng Tin Quầy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCanteenId}
                    onChange={(e) => setFormCanteenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-bold text-slate-900 outline-hidden"
                  >
                    {canteens.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.location})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Danh Mục & Giá Bán */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    Danh Mục Món <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-bold text-slate-900 outline-hidden"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    Giá Bán (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    min="1000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-mono font-bold text-orange-600 text-sm outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Giá Gốc Gốc (VNĐ)</label>
                  <input
                    type="number"
                    step="1000"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Tùy chọn hiển thị giảm giá"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-mono text-slate-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Row 3: Image URL & Quick Picker */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Link Hình Ảnh Món (URL)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Nhập URL hình ảnh hoặc chọn mẫu bên dưới</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl font-mono text-xs text-slate-700 outline-hidden"
                  />
                  {formImage && (
                    <img src={formImage} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                  )}
                </div>

                {/* Preset Image Options */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-400 font-semibold shrink-0">Gợi ý mẫu ảnh:</span>
                  {imagePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 font-medium rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Mô tả & Thành phần */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Mô Tả Món Ăn</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Mô tả hương vị, nguyên liệu chế biến hấp dẫn..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-xs font-medium text-slate-800 outline-hidden resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700">Thành Phần (Phân cách bằng dấu phẩy)</label>
                  <textarea
                    rows={3}
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    placeholder="Ví dụ: Đùi gà, Nước mắm, Tỏi ớt, Gạo thơm ST25..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-xs font-medium text-slate-800 outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Row 5: Thời gian chế biến & Tùy chọn cờ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> Thời gian chế biến trung bình (Phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-hidden"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <span className="font-extrabold text-slate-700 block">Trạng Thái & Gắn Nhãn Món</span>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsAvailable}
                        onChange={(e) => setFormIsAvailable(e.target.checked)}
                        className="w-4 h-4 rounded-md accent-emerald-600"
                      />
                      <span className={formIsAvailable ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                        Đang Bán (Còn Hàng)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsBestSeller}
                        onChange={(e) => setFormIsBestSeller(e.target.checked)}
                        className="w-4 h-4 rounded-md accent-amber-500"
                      />
                      <span className="text-amber-700 font-bold">Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsVegetarian}
                        onChange={(e) => setFormIsVegetarian(e.target.checked)}
                        className="w-4 h-4 rounded-md accent-emerald-600"
                      />
                      <span className="text-emerald-800 font-bold">Món Chay</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-extrabold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingFood ? 'Lưu Thay Đổi Món' : 'Thêm Món Vào Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Tables & QR Management from Live MySQL */}
      {activeTab === 'TABLES' && (
        <div className="space-y-6">
          <AdminTablesView />
        </div>
      )}
    </div>
  );
};
