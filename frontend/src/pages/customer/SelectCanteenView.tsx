import React from 'react';
import { useApp } from '../../context/AppContext';
import { Canteen } from '../../types';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  Utensils,
} from 'lucide-react';
import { motion } from 'motion/react';

export const SelectCanteenView: React.FC = () => {
  const {
    canteens,
    selectedCanteen,
    setSelectedCanteen,
    setOrderType,
    foods,
    navigateTo,
    viewParams,
    showToast,
  } = useApp();

  const handleSelectCanteen = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    setOrderType('PICKUP');
    showToast(`🏃‍♂️ Đã chọn: ${canteen.name}`, 'success');
    navigateTo('category', { canteenId: canteen.id, canteen });
  };

  const handleBack = () => {
    if (viewParams?.fromCategory) {
      navigateTo('category');
    } else {
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
            <span className="text-xs font-semibold hidden sm:inline">Quay lại</span>
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 text-center flex-1 truncate">
            Chọn Căng Tin Nhận Món
          </h1>

          {/* Spacer to keep title centered */}
          <div className="w-9" aria-hidden="true" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4">
        {/* Canteens List */}
        <div className="space-y-1">
          <div className="divide-y divide-slate-200/90 border-y border-slate-200/90">
            {canteens.map((canteen, idx) => {
              const isSelected = selectedCanteen?.id === canteen.id;

              return (
                <motion.div
                  key={canteen.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => handleSelectCanteen(canteen)}
                  className={`py-3 px-2 flex items-center justify-between gap-3 cursor-pointer transition-colors active:scale-[0.99] hover:bg-slate-100/70 ${isSelected ? 'bg-orange-50/80' : 'bg-transparent'
                    }`}
                >
                  {/* Left: Thumbnail & Essential Info (Name, Location, Rating) */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 bg-slate-200 relative">
                      <img
                        src={canteen.image}
                        alt={canteen.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-orange-600' : 'text-slate-900'
                            }`}
                        >
                          {canteen.name}
                        </h3>
                        {isSelected && (
                          <span className="shrink-0 text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">
                            Đang chọn
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{canteen.location}</span>
                      </p>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{canteen.rating}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          ({canteen.reviewCount} đánh giá)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Arrow button */}
                  <div className="shrink-0 text-slate-400 pl-1">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
