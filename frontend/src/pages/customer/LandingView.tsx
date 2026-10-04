import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  Sparkles,
  QrCode,
  Clock,
  Truck,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowRight,
  Flame,
  Award,
  Zap,
  User,
  MapPin,
  Coffee,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { navigateTo, setQrScannerOpen, foods, canteens } = useApp();

  const featuredFoods = foods.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
      {/* 1. Header Bar inside Landing (No top global navbar) */}
      <header className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Uni<span className="text-orange-500">Eat</span>
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest -mt-1">
              Campus Canteen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('login', { next: '/home' })}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Vào ứng dụng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glowing Ambient Background Blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-orange-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Hệ Thống Đặt Món Căng Tin Đại Học Thông Minh</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Thưởng Thức Món Ngon <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Căng Tin Siêu Tốc
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Không còn nỗi lo chen lấn hay chờ đợi xếp hàng giờ cao điểm. Đặt món trước nhận ngay,
            giao tận phòng KTX/lớp học, hoặc quét QR tại bàn ăn dễ dàng.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => navigateTo('home')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>Đặt Món Ngay</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setQrScannerOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <QrCode className="w-5 h-5 text-orange-400" />
              <span>Quét QR Tại Bàn</span>
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="pt-8 grid grid-cols-3 gap-3 border-t border-slate-800/80 max-w-lg mx-auto text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">10+</div>
              <div className="text-[11px] text-slate-400 font-medium">Căng tin trường</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">15.000+</div>
              <div className="text-[11px] text-slate-400 font-medium">Đơn hàng/tháng</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Đánh giá tốt</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Feature Cards Grid */}
      <section className="py-12 bg-slate-950/60 border-y border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hình Thức Đặt Món Linh Hoạt
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Đáp ứng mọi nhu cầu của sinh viên & giảng viên trong khuôn viên đại học
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-3xl p-6 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Quét QR Tại Bàn</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ngồi ngay tại bàn ăn căng tin, quét mã QR dán trên bàn để xem thực đơn và thanh toán. Đồ ăn được mang tận bàn.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-3xl p-6 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Hẹn Giờ Nhận Món</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chọn trước khung giờ rảnh giữa các ca học. Món ăn được chuẩn bị sẵn sàng, đến căng tin lấy món trong 30 giây.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-3xl p-6 transition-all duration-300 space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Giao Tận Phòng KTX</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Giao đồ ăn tận phòng ký túc xá, phòng học hoặc thư viện. Shipper nội khu thân thiện, nhận đồ nhanh chóng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trending Food Teaser */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>Gợi Ý Món HOT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Thực Đơn Được Yêu Thích Nhất
            </h2>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {featuredFoods.map((food) => (
            <div
              key={food.id}
              onClick={() => navigateTo('food-detail', { foodId: food.id })}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400" /> {food.rating}
                </span>
              </div>

              <div className="p-3 space-y-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {food.name}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {food.canteenName || 'Căng tin A1'}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm text-sky-400">
                    {food.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg">
                    Thử ngay
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Canteen Locations Teaser */}
      <section className="py-10 bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Đầy đủ các điểm Căng tin trong Campus
            </h3>
            <p className="text-xs text-slate-400 max-w-lg">
              Kết nối trực tiếp Căng tin Khu A, Căng tin Khu B, Căng tin Thư viện, Quán Ăn Vặt & Cafe Campus.
            </p>
          </div>

          <button
            onClick={() => navigateTo('section-list', { title: 'Căng tin trường', filterType: 'CANTEEN_LIST' })}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 cursor-pointer transition-colors shrink-0"
          >
            <MapPin className="w-4 h-4 text-orange-400" />
            <span>Danh sách Căng tin</span>
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-8 px-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-medium text-slate-400">
            © 2026 UniEat Campus Food System. Được phát triển dành riêng cho cộng đồng sinh viên.
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-semibold text-[11px]">
            <button onClick={() => navigateTo('home')} className="hover:text-slate-300">Trang chủ</button>
            <span>•</span>
            <button onClick={() => navigateTo('menu')} className="hover:text-slate-300">Thực đơn</button>
            <span>•</span>
            <button onClick={() => navigateTo('login', { next: '/home' })} className="hover:text-slate-300">Đăng nhập</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
