import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BannerItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badgeBg: string;
  promoCode?: string;
}

const BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    badge: '🎁 MUA 1 TẶNG 1',
    title: 'Combo Cơm Gà Chiên Mắm Tỏi',
    subtitle: 'TẶNG NGAY 1 Trà Đào Sảng Khoái',
    description: 'Áp dụng cho đơn hàng cơm gà tại Căng tin A & B hôm nay!',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    badgeBg: 'bg-[#FF4F8B] text-white',
    promoCode: 'MUA1TANG1',
  },
  {
    id: 'banner-2',
    badge: '⚡ FLASH SALE TẬN PHÒNG',
    title: 'Đồng Giá 19.000đ Bún & Phở',
    subtitle: 'Giảm tới 45% Khung Giờ Vàng 11h30 - 13h30',
    description: 'Bún chả Hà Nội, phở bò tái lăn giao nhanh KTX',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1200&auto=format&fit=crop',
    badgeBg: 'bg-[#FF7A59] text-white',
    promoCode: 'BUNPHO19K',
  },
  {
    id: 'banner-3',
    badge: '🚚 FREESHIP KTX 0Đ',
    title: 'Giao Hàng 0 Đồng Tận Phòng',
    subtitle: 'Nhập mã FREESHIPKTX cho đơn từ 30K',
    description: 'Đội shipper sinh viên giao hàng thần tốc 15 phút',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1200&auto=format&fit=crop',
    badgeBg: 'bg-[#22C55E] text-white',
    promoCode: 'FREESHIPKTX',
  },
  {
    id: 'banner-4',
    badge: '🍱 COMBO TIẾT KIỆM',
    title: 'Bữa Tối Sinh Viên Chỉ 29K',
    subtitle: 'Cơm Tấm Sườn Bì + Canh + Trà Đá',
    description: 'Đầy đủ dinh dưỡng, thơm ngon bổ dưỡng cho giờ ôn thi',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop',
    badgeBg: 'bg-[#E83E78] text-white',
    promoCode: 'COMBO29K',
  },
];

interface BannerSliderProps {
  onBannerClick?: (banner: BannerItem) => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const currentBanner = BANNERS[currentIndex];

  return (
    <div
      onClick={() => onBannerClick && onBannerClick(currentBanner)}
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E9DDE3] shadow-xs bg-white group select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[160px] sm:h-[195px] md:h-[220px] w-full overflow-hidden bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full flex items-center justify-between"
          >
            {/* Left Content Area */}
            <div className="relative z-10 h-full p-4 sm:p-6 md:p-8 flex flex-col justify-center max-w-[68%] sm:max-w-[62%] space-y-1.5 sm:space-y-2 bg-gradient-to-r from-white via-white/95 to-transparent pr-8">
              {/* Badge */}
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-tight shadow-xs ${currentBanner.badgeBg}`}
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  {currentBanner.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-lg md:text-xl font-black text-[#1F2937] leading-tight line-clamp-1">
                  {currentBanner.title}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[#FF4F8B] line-clamp-1">
                  {currentBanner.subtitle}
                </p>
                <p className="text-[11px] sm:text-xs text-[#64748B] font-medium line-clamp-2 hidden sm:block">
                  {currentBanner.description}
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="absolute inset-y-0 right-0 w-3/5 h-full overflow-hidden">
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              />
              {/* Fade gradient from white to image */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer shadow-sm border border-[#E9DDE3]"
          aria-label="Banner trước"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs text-slate-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer shadow-sm border border-[#E9DDE3]"
          aria-label="Banner tiếp"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Centered Indicator Dots */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-5 bg-[#FF4F8B]' : 'w-1.5 bg-white/50 hover:bg-white'
              }`}
              aria-label={`Chuyển tới slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
