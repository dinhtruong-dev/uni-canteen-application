import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { DeliveryAddress } from '../../types';
import {
  ArrowLeft,
  Building,
  Home,
  Phone,
  FileText,
  Check,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';

const COMMON_BUILDINGS = [
  { id: 'ktx-a1', name: 'KTX A1', desc: 'KTX Nam - Khu A', campus: 'Khu A' },
  { id: 'ktx-a2', name: 'KTX A2', desc: 'KTX Nữ - Khu A', campus: 'Khu A' },
  { id: 'ktx-b1', name: 'KTX B1', desc: 'KTX Nam - Khu B', campus: 'Khu B' },
  { id: 'ktx-b2', name: 'KTX B2', desc: 'KTX Nữ - Khu B', campus: 'Khu B' },
  { id: 'gd-a2', name: 'Giảng Đường A2', desc: 'Khu Học Tập Trung Tâm', campus: 'Khu A' },
  { id: 'gd-b4', name: 'Tòa CNTT B4', desc: 'Viện Công Nghệ Thông Tin', campus: 'Khu B' },
  { id: 'gd-c1', name: 'Nhà Thể Thao C1', desc: 'Khu Giáo Dục Thể Chất', campus: 'Khu C' },
  { id: 'gd-lib', name: 'Thư Viện Trung Tâm', desc: 'Tòa Nhà Tri Thức', campus: 'Khu A' },
];

const ROOM_SUGGESTIONS = [
  'Phòng 204',
  'Phòng 102',
  'Phòng 305',
  'Phòng 408',
  'Phòng 512',
  'Sảnh Tầng 1',
  'P.Học 302',
];

export const DeliveryLocationView: React.FC = () => {
  const {
    deliveryAddress,
    setDeliveryAddress,
    setOrderType,
    currentUser,
    navigateTo,
    viewParams,
    showToast,
  } = useApp();

  const [building, setBuilding] = useState<string>('KTX A1');
  const [customBuilding, setCustomBuilding] = useState<string>('');
  const [isCustomBuilding, setIsCustomBuilding] = useState<boolean>(false);
  const [room, setRoom] = useState<string>('Phòng 204');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
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
  }, [deliveryAddress, currentUser]);

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
    showToast(`🛵 Đã lưu địa chỉ giao: ${finalAddress.building}, ${finalAddress.room}`, 'success');

    if (viewParams?.fromCategory) {
      navigateTo('category');
    } else {
      navigateTo('category');
    }
  };

  const handleBack = () => {
    if (viewParams?.fromCategory) {
      navigateTo('category');
    } else {
      navigateTo('home');
    }
  };

  const activeBuildingName = isCustomBuilding ? (customBuilding || '...') : building;

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

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              Địa chỉ nhận món KTX
            </h1>
            <p className="text-[11px] text-emerald-600 font-medium truncate">
              🛵 Giao tận phòng nhanh chóng & nóng hổi
            </p>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 font-bold">
            🛵
          </div>
        </div>
      </div>

      {/* Main Content Form */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Quick Saved Addresses (if any) */}
          {currentUser?.savedAddresses && currentUser.savedAddresses.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-2.5"
            >
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Địa chỉ thường dùng của bạn
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentUser.savedAddresses.map((saved, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSaved(saved)}
                    className="px-3 py-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {saved.building} - {saved.room}
                    </span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Step 1: Choose Building / Dorm */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                  1
                </div>
                <span>Chọn Tòa nhà / Ký Túc Xá</span>
                <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCustomBuilding(!isCustomBuilding)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
              >
                {isCustomBuilding ? 'Chọn từ danh sách có sẵn' : '+ Nhập tòa nhà khác'}
              </button>
            </div>

            {!isCustomBuilding ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {COMMON_BUILDINGS.map((bld) => {
                  const isSelected = building === bld.name;
                  return (
                    <button
                      key={bld.id}
                      type="button"
                      onClick={() => handleSelectBuilding(bld.name)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'
                            }`}
                        >
                          {bld.name}
                        </span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">{bld.campus}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 line-clamp-1">{bld.desc}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={customBuilding}
                  onChange={(e) => setCustomBuilding(e.target.value)}
                  placeholder="Ví dụ: KTX C2, Khu nhà công vụ, Thư viện..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-800 outline-hidden bg-slate-50/50"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500">
                  Nhập tên giảng đường hoặc tòa nhà trong khuôn viên trường
                </p>
              </div>
            )}
          </motion.section>

          {/* Step 2: Room & Suggestions */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-xs space-y-3"
          >
            <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                2
              </div>
              <span>Số phòng / Vị trí nhận</span>
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ví dụ: Phòng 204, P.305 Tầng 3..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-800 outline-hidden bg-slate-50/50"
              required
            />

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500 font-medium">Chọn nhanh:</span>
              {ROOM_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setRoom(sug)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${room === sug
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Step 3: Receiver Phone & Note */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/70 shadow-xs space-y-3.5"
          >
            <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                3
              </div>
              <span>Thông tin liên hệ & Ghi chú</span>
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Số điện thoại người nhận
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-800 outline-hidden bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Ghi chú cho Shipper
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Gọi điện trước khi lên, gửi bảo vệ nếu vắng mặt..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-medium text-slate-800 outline-hidden bg-slate-50/50"
              />
            </div>
          </motion.section>

          {/* Delivery Assurance Card */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-3xl flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-950 space-y-0.5">
              <p className="font-bold text-emerald-900">
                Giao đến: {activeBuildingName}, {room || 'Chưa nhập phòng'}
              </p>
              <p className="text-[11px] text-emerald-800/80">
                Shipper nội bộ trường giao tận nơi trong 15-20 phút kể từ lúc quán nấu xong.
              </p>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <span>Xác nhận & Xem Thực Đơn</span>
              <span className="text-lg">🚀</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
