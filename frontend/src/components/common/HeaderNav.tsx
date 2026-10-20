import React from 'react';
import { ArrowLeft, MapPin, Share2 } from 'lucide-react';

export interface HeaderNavProps {
  title: string;
  subtitle?: string;
  showLocationIcon?: boolean;
  onBack: () => void;
  backIcon?: React.ReactNode;
  onShare?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  title,
  subtitle,
  showLocationIcon = false,
  onBack,
  backIcon,
  onShare,
  rightAction,
  className = '',
}) => {
  return (
    <header className={`sticky top-0 z-30 -mx-3 sm:-mx-6 lg:-mx-8 w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs ${className}`}>
      {/* 1. Nút Quay Lại (Back Button) */}
      <button
        type="button"
        onClick={onBack}
        className="p-1 -ml-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
        aria-label="Quay lại"
      >
        {backIcon || <ArrowLeft className="w-5 h-5 stroke-[2.5]" />}
      </button>

      {/* 2. Khung Tiêu Đề Trung Tâm (Centered Title & Subtitle) */}
      <div className="text-center flex-1 px-2 min-w-0">
        <h1 className="text-[17px] font-bold text-slate-900 leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-slate-500 font-normal truncate mt-0.5">
            {showLocationIcon && (
              <MapPin className="w-3 h-3 text-[#FF4F8B] inline-block mr-1 -mt-0.5 shrink-0" />
            )}
            <span>{subtitle}</span>
          </p>
        )}
      </div>

      {/* 3. Nút Hành Động Góc Phải hoặc Spacer w-6 */}
      {rightAction ? (
        <div className="shrink-0 flex items-center justify-end min-w-[24px]">
          {rightAction}
        </div>
      ) : onShare ? (
        <button
          type="button"
          onClick={onShare}
          className="p-1 -mr-1 text-slate-800 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
          aria-label="Chia sẻ"
          title="Chia sẻ"
        >
          <Share2 className="w-5 h-5 stroke-[2]" />
        </button>
      ) : (
        <div className="w-6 shrink-0" aria-hidden="true" />
      )}
    </header>
  );
};
