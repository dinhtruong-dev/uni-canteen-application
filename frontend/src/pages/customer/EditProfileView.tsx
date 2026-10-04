import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Camera, Save } from 'lucide-react';

export const EditProfileView: React.FC = () => {
  const { currentUser, updateProfile, showToast, navigateTo } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-slate-600 font-bold text-sm">Vui lòng đăng nhập để chỉnh sửa thông tin.</p>
        <button
          onClick={() => navigateTo('login', { next: 'edit-profile' })}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Phone state (only phone is editable)
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Read-only values from currentUser
  const name = currentUser.name;
  const studentId = currentUser.studentId || '2022601234';
  const email = currentUser.email;
  const gender = currentUser.gender || 'Nam';
  const dateOfBirth = currentUser.dateOfBirth || '15/08/2004';
  const department = currentUser.department || 'Công Nghệ Thông Tin';
  const className = currentUser.className || 'CNTT 01 - K67';
  const isEmailVerified = currentUser.isEmailVerified ?? true;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Dung lượng ảnh quá lớn (vui lòng chọn ảnh < 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          showToast('Đã chọn ảnh đại diện mới!', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      phone,
      avatar,
    });
    showToast('Đã lưu thông tin tài khoản thành công!', 'success');
    navigateTo('profile');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200 px-1 sm:px-0">
      {/* Top Header Bar - Icon only back button, Title: Thông tin tài khoản */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={() => navigateTo('profile')}
          className="p-2 -ml-2 rounded-full text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 text-center flex-1">
          Thông tin tài khoản
        </h1>
        <div className="w-9"></div> {/* Spacer balance */}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
        {/* Avatar - Only Avatar circle with Camera badge icon */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Đổi ảnh đại diện"
          >
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-orange-500/20 shadow-sm group-hover:opacity-90 transition-opacity"
            />
            {/* Camera Overlay Badge on Avatar */}
            <div className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-md border-2 border-white transition-transform group-hover:scale-110">
              <Camera className="w-4 h-4" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Fields List - Bottom Border Only Styling, NO Outer Card Box */}
        <div className="space-y-4 pt-2">
          {/* 1. Họ và tên (Read-only) */}
          <div className="border-b border-slate-100 pb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Họ và tên
            </span>
            <div className="text-sm font-extrabold text-slate-900">{name}</div>
          </div>

          {/* 2. Mã sinh viên (Read-only) */}
          <div className="border-b border-slate-100 pb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Mã sinh viên (MSV)
            </span>
            <div className="text-xs font-extrabold text-slate-800">{studentId}</div>
          </div>

          {/* 3. Giới tính & Năm sinh (Read-only - Grid 2 cols) */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Giới tính
              </span>
              <div className="text-xs font-semibold text-slate-800">{gender}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Ngày / Năm sinh
              </span>
              <div className="text-xs font-semibold text-slate-800">{dateOfBirth}</div>
            </div>
          </div>

          {/* 4. Số điện thoại nhận hàng (EDITABLE - Bottom Border Input) */}
          <div className="border-b border-slate-300 focus-within:border-orange-500 pb-1.5 transition-colors">
            <label className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider block mb-0.5">
              Số điện thoại nhận hàng (Chỉnh sửa được)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="w-full py-1 bg-transparent text-sm font-extrabold text-slate-900 outline-none placeholder:text-slate-300"
              required
            />
          </div>

          {/* 5. Email sinh viên (Read-only) */}
          <div className="border-b border-slate-100 pb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email sinh viên
              </span>
              {isEmailVerified && (
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Đã xác thực ✓
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-800">{email}</div>
          </div>

          {/* 6. Khoa / Viện & Lớp sinh hoạt (Read-only) */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Khoa / Viện
              </span>
              <div className="text-xs font-semibold text-slate-800">{department}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Lớp sinh hoạt
              </span>
              <div className="text-xs font-semibold text-slate-800">{className}</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 cursor-pointer transition-all inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
