import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { DeliveryAddress } from '../../types';
import { X, MapPin, Building, Home, Phone, FileText, Check, Navigation, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeliveryLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (address: DeliveryAddress) => void;
}

const COMMON_BUILDINGS = [
  { id: 'ktx-a1', name: 'KTX A1', desc: 'KTX Nam - Khu A' },
  { id: 'ktx-a2', name: 'KTX A2', desc: 'KTX Nữ - Khu A' },
  { id: 'ktx-b1', name: 'KTX B1', desc: 'Khu B' },
  { id: 'ktx-b2', name: 'KTX B2', desc: 'Khu B' },
  { id: 'gd-a2', name: 'Giảng Đường A2', desc: 'Khu Trung Tâm' },
  { id: 'gd-b4', name: 'Tòa CNTT B4', desc: 'Khoa Công Nghệ' },
];

const ROOM_SUGGESTIONS = ['Phòng 204', 'Phòng 102', 'Phòng 305', 'Phòng 408', 'Phòng 512', 'Sảnh Tầng 1'];

export const DeliveryLocationModal: React.FC<DeliveryLocationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { deliveryAddress, setDeliveryAddress, setOrderType, currentUser, showToast } = useApp();

  const [building, setBuilding] = useState<string>('KTX A1');
  const [customBuilding, setCustomBuilding] = useState<string>('');
  const [isCustomBuilding, setIsCustomBuilding] = useState<boolean>(false);
  const [room, setRoom] = useState<string>('Phòng 204');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Sync with current deliveryAddress or user defaults when opening
  useEffect(() => {
    if (isOpen) {
      if (deliveryAddress) {
        const found = COMMON_BUILDINGS.find((b) => b.name === deliveryAddress.building);
        if (found) {
          setBuilding(deliveryAddress.building);
          setIsCustomBuilding(false);
        } else {
          setIsCustomBuilding(true);
          setCustomBuilding(deliveryAddress.building);
        }
        setRoom(deliveryAddress.room || 'Phòng 204');
        setPhone(deliveryAddress.phone || currentUser?.phone || '');
        setNotes(deliveryAddress.notes || '');
      } else {
        setBuilding('KTX A1');
        setIsCustomBuilding(false);
        setRoom('Phòng 204');
        setPhone(currentUser?.phone || '');
        setNotes('');
      }
    }
  }, [isOpen, deliveryAddress, currentUser]);

  if (!isOpen) return null;

  const handleSelectBuilding = (bldName: string) => {
    setBuilding(bldName);
    setIsCustomBuilding(false);
  };

  const handleSelectSaved = (saved: DeliveryAddress) => {
    const found = COMMON_BUILDINGS.find((b) => b.name === saved.building);
    if (found) {
      setBuilding(saved.building);
      setIsCustomBuilding(false);
    } else {
      setIsCustomBuilding(true);
      setCustomBuilding(saved.building);
    }
    setRoom(saved.room);
    if (saved.phone) setPhone(saved.phone);
    if (saved.notes) setNotes(saved.notes);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBuilding = isCustomBuilding ? customBuilding.trim() : building;
    if (!selectedBuilding) {
      showToast('Vui lòng chọn hoặc nhập tên Tòa nhà / KTX!', 'warning');
      return;
    }
    if (!room.trim()) {
      showToast('Vui lòng nhập số phòng giao đến!', 'warning');
      return;
    }

    const finalAddress: DeliveryAddress = {
      campus: 'Cơ sở chính (Main Campus)',
      area: selectedBuilding.includes('KTX') ? 'Khu Ký Túc Xá' : 'Khu Giảng Đường',
      building: selectedBuilding,
      floor: room.includes('Tầng') ? room : `Tầng ${room.replace(/\D/g, '').charAt(0) || '1'}`,
      room: room.trim(),
      phone: phone.trim() || currentUser?.phone || '0912 345 678',
      notes: notes.trim(),
      isDefault: true,
    };

    setDeliveryAddress(finalAddress);
    setOrderType('DELIVERY');
    showToast(`🛵 Đã ghi nhớ địa chỉ: ${finalAddress.building}, ${finalAddress.room}`, 'success');

    if (onConfirm) {
      onConfirm(finalAddress);
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
          className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-[#22C55E] to-emerald-700 text-white p-4 sm:p-5 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-xs">
                🛵
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Bạn đang ở đâu?
                </h3>
                <p className="text-xs text-white/90">
                  Chọn tòa nhà / KTX của bạn nhé!
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleConfirm} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Quick saved addresses if available */}
            {currentUser?.savedAddresses && currentUser.savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Địa chỉ thường dùng của bạn
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {currentUser.savedAddresses.map((saved, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSaved(saved)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{saved.building} - {saved.room}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Select Building */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  Tòa nhà / Ký Túc Xá <span className="text-red-500">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomBuilding(!isCustomBuilding)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer underline"
                >
                  {isCustomBuilding ? 'Chọn từ danh sách' : 'Nhập tòa khác'}
                </button>
              </label>

              {!isCustomBuilding ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_BUILDINGS.map((bld) => {
                    const isSelected = building === bld.name;
                    return (
                      <button
                        key={bld.id}
                        type="button"
                        onClick={() => handleSelectBuilding(bld.name)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {bld.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-0.5">{bld.desc}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={customBuilding}
                    onChange={(e) => setCustomBuilding(e.target.value)}
                    placeholder="Ví dụ: KTX C2, Nhà D3, Thư viện..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-800 outline-hidden"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* 2. Room number with quick suggestion pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                Số phòng / Tầng <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng 204, P.305 Tầng 3..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-800 outline-hidden"
                  required
                />
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
                {ROOM_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setRoom(sug)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${room === sug
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Số điện thoại người nhận
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-800 outline-hidden"
              />
            </div>

            {/* 4. Notes for Shipper */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Ghi chú cho Shipper (Tùy chọn)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Gọi điện trước khi lên, gửi bác bảo vệ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium text-slate-800 outline-hidden"
              />
            </div>

            {/* Preview Banner of Chosen Address */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="leading-tight">
                <span className="font-semibold text-slate-500 text-[11px] block">Xem trước địa chỉ giao:</span>
                <span className="font-bold text-emerald-800">
                  🛵 {isCustomBuilding ? (customBuilding || '...') : building}, {room || '...'}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Xác nhận & Xem thực đơn</span>
                <span className="text-base">🚀</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
