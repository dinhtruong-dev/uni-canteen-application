import React from 'react';
import { useApp } from '../store/AppContext';
import { Canteen } from '../types';
import { X, Store, MapPin, Clock, Star, CheckCircle2, ChevronRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PickupCanteenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (canteen: Canteen) => void;
}

export const PickupCanteenModal: React.FC<PickupCanteenModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { canteens, selectedCanteen, setSelectedCanteen, setOrderType, foods, showToast } = useApp();

  if (!isOpen) return null;

  const handleSelectCanteen = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    setOrderType('PICKUP');
    showToast(`🏃‍♂️ Đã chọn: ${canteen.name}`, 'success');

    if (onSelect) {
      onSelect(canteen);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#FF7A59] to-orange-600 text-white p-4 sm:p-5 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-xs">
                🏃‍♂️
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Bạn muốn xuống Căng tin nào lấy?
                </h3>
                <p className="text-xs text-white/90">
                  Chọn căng tin thuận tiện nhất để nhận món nóng hổi
                </p>
              </div>
            </div>
          </div>

          {/* List view of Canteens */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
            <p className="text-xs font-semibold text-slate-500">
              Có {canteens.length} căng tin đang phục vụ tại trường:
            </p>

            <div className="space-y-3">
              {canteens.map((canteen) => {
                const isSelected = selectedCanteen?.id === canteen.id;
                const canteenFoodsCount = foods.filter((f) => f.canteenId === canteen.id).length;

                return (
                  <button
                    key={canteen.id}
                    type="button"
                    onClick={() => handleSelectCanteen(canteen)}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 group relative ${isSelected
                      ? 'border-orange-500 bg-orange-50/70 shadow-xs ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                      }`}
                  >
                    {/* Canteen Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                      <img
                        src={canteen.image}
                        alt={canteen.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span
                        className={`absolute top-1 left-1 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md ${canteen.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                          }`}
                      >
                        {canteen.isOpen ? 'Mở cửa' : 'Đóng'}
                      </span>
                    </div>

                    {/* Canteen Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs sm:text-sm font-bold truncate group-hover:text-orange-600 transition-colors ${isSelected ? 'text-orange-950' : 'text-slate-800'
                            }`}
                        >
                          {canteen.name}
                        </h4>
                        {isSelected && (
                          <span className="shrink-0 text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đang chọn
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        <span className="truncate">{canteen.location}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{canteen.rating}</span>
                          <span className="text-slate-400 font-normal">({canteen.reviewCount})</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{canteen.openingHours}</span>
                        </span>
                        {canteenFoodsCount > 0 && (
                          <span className="hidden sm:inline text-orange-600 font-medium">
                            • {canteenFoodsCount} món
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow / Action indicator */}
                    <div className="shrink-0 text-slate-400 group-hover:text-orange-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 shrink-0">
            💡 Mẹo: Bạn có thể đặt trước 10-15 phút để nhà bếp chuẩn bị sẵn món nhé!
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
