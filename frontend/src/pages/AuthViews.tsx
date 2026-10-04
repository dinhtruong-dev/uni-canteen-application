import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Eye, EyeOff, Lock, Mail, User, Phone, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, navigateTo, viewParams } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy đường dẫn chuyển tiếp (Shopee pattern: ?next=...)
  const nextTarget =
    viewParams?.next ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : '') ||
    '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return;
    }
    setLoading(true);
    await login(email.trim(), password, nextTarget || undefined);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Imagery & Slogan */}
        <div className="relative bg-linear-to-br from-orange-600 to-amber-600 text-white p-8 flex flex-col justify-between hidden md:flex">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800')` }} />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-black text-xl shadow-lg mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-amber-200 font-extrabold text-xs uppercase tracking-widest block">
              UniEat System
            </span>
            <h2 className="text-3xl font-black mt-2 leading-tight">
              "Đặt món nhanh - <br />
              <span className="text-amber-200">Ăn ngon trong trường"</span>
            </h2>
          </div>

          <div className="relative z-10 space-y-3 text-xs text-orange-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" /> Quét QR đặt tại chỗ không lo xếp hàng
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" /> Đặt nhận theo hẹn khung giờ rảnh
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" /> Giao món tận phòng KTX / Giảng đường
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <Utensils className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-slate-900">UniEat</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng Nhập</h2>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng nhập tài khoản email và mật khẩu của bạn
            </p>

            {nextTarget && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Bạn sẽ được tự động chuyển tiếp tới trang đã chọn sau khi đăng nhập.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email đăng nhập:</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input type="checkbox" defaultChecked className="rounded-md text-orange-600" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="text-orange-600 font-bold hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Đang xác thực qua Backend API...' : 'Đăng Nhập Ngay'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigateTo('register', nextTarget ? { next: nextTarget } : {})}
              className="text-orange-600 font-extrabold hover:underline cursor-pointer"
            >
              Đăng ký tài khoản sinh viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterView: React.FC = () => {
  const { register, navigateTo, showToast, viewParams } = useApp();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Công Nghệ Thông Tin');
  const [className, setClassName] = useState('CNTT 01 - K68');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy đường dẫn chuyển tiếp (Shopee pattern: ?next=...)
  const nextTarget =
    viewParams?.next ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : '') ||
    '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Mật khẩu bảo mật phải có tối thiểu 6 ký tự!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.', 'error');
      return;
    }

    setLoading(true);
    await register({ name, studentId, email, phone, department, className, password }, nextTarget || undefined);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 max-w-xl w-full space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tạo Tài Khoản Sinh Viên</h2>
          <p className="text-xs text-slate-500 mt-1">Đăng ký tài khoản nội bộ trường để nhận ưu đãi nạp ví</p>

          {nextTarget && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tự động chuyển tiếp đến trang bạn đang chọn sau khi đăng ký thành công.</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Họ và tên:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã Sinh Viên (MSSV):</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="2026001234"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email sinh viên:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="a.nguyen@st.university.edu.vn"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987 654 321"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Khoa / Viện:</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lớp:</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu (tối thiểu 6 ký tự):</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Xác nhận mật khẩu:</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2 font-medium text-slate-600">
            <input type="checkbox" required defaultChecked className="rounded-md text-orange-600" />
            <span>Tôi đồng ý với điều khoản sử dụng hệ thống căng tin trường</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản (+Tặng 50.000đ vào Ví)'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <button
            onClick={() => navigateTo('login', nextTarget ? { next: nextTarget } : {})}
            className="text-orange-600 font-bold hover:underline cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordView: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    showToast('Đã gửi mã xác nhận OTP về email sinh viên của bạn!', 'info');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập lại.', 'success');
    navigateTo('login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 max-w-md w-full space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quên Mật Khẩu</h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 ? 'Nhập email sinh viên để nhận mã OTP khôi phục' : 'Nhập mã OTP và mật khẩu mới'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email sinh viên:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="an.nguyen22@st.university.edu.vn"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-extrabold py-3.5 rounded-xl text-sm"
            >
              Gửi Mã Xác Nhận
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mã OTP (6 chữ số):</label>
              <input
                type="text"
                required
                placeholder="123456"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-lg font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu mới:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-extrabold py-3.5 rounded-xl text-sm"
            >
              Đặt Mật Khẩu Mới
            </button>
          </form>
        )}

        <div className="text-center text-xs">
          <button onClick={() => navigateTo('login')} className="text-slate-500 hover:text-slate-800 font-bold">
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
