import React from 'react';
import { ArrowLeft, MapPin, Share2 } from 'lucide-react';

export interface HeaderNavProps {
  /** Tiêu đề chính hiển thị ở trung tâm header (ví dụ: Tên Căng tin, Tên danh mục món) */
  title: string;
  /** Tiêu đề phụ hiển thị nhỏ bên dưới title (ví dụ: Địa chỉ, vị trí) */
  subtitle?: string;
  /** Cờ cho biết có hiển thị icon vị trí MapPin bên cạnh subtitle hay không */
  showLocationIcon?: boolean;
  /** Hàm xử lý sự kiện khi bấm nút Quay lại (Back Arrow) */
  onBack: () => void;
  /** (Tùy chọn) Hàm xử lý sự kiện khi bấm nút Chia sẻ (Share) */
  onShare?: () => void;
  /** (Tùy chọn) Element hành động tùy chỉnh ở góc phải thay thế cho nút Share mặc định */
  rightAction?: React.ReactNode;
  /** (Tùy chọn) ClassName bổ sung để tùy biến thêm css cho container ngoài */
  className?: string;
}

/**
 * HeaderNav - Component Header điều hướng tái sử dụng chuẩn hóa cho ứng dụng UniEat.
 * Tự động căn giữa tiêu đề hoàn hảo dù có nút Chia sẻ hay không nhờ Spacer fallback.
 */
export const HeaderNav: React.FC<HeaderNavProps> = ({
  title,
  subtitle,
  showLocationIcon = false,
  onBack,
  onShare,
  rightAction,
  className = '',
}) => {
  return (
    <div className={`sticky top-0 z-30 pt-2 bg-transparent ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#E9DDE3] px-1 sm:px-0">
        {/* 1. Nút Quay Lại (Back Button) */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Quay lại"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-[#1F2937]" />
        </button>

        {/* 2. Khung Tiêu Đề Trung Tâm (Centered Title & Subtitle) */}
        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#1F2937] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[#64748B] truncate flex items-center justify-center gap-1 mt-0.5">
              {showLocationIcon && (
                <MapPin className="w-3 h-3 text-[#FF4F8B] shrink-0" />
              )}
              <span>{subtitle}</span>
            </p>
          )}
        </div>

        {/* 3. Nút Hành Động Góc Phải hoặc Spacer Fallback */}
        {rightAction ? (
          <div className="shrink-0">{rightAction}</div>
        ) : onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#FFF3F7] active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Chia sẻ"
            title="Chia sẻ"
          >
            <Share2 className="w-5 h-5 text-[#1F2937]" />
          </button>
        ) : (
          /* Spacer 40px (10rem/2.5rem) giữ title luôn được căn giữa tuyệt đối */
          <div className="w-10 h-10 shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
