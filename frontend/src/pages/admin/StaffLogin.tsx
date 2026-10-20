import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  ShieldCheck,
  UtensilsCrossed,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  ChefHat,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  HelpCircle,
  KeyRound,
} from 'lucide-react';

interface AdminStaffLoginViewProps {
  initialRole?: 'ADMIN' | 'STAFF';
}

export const AdminStaffLoginView: React.FC<AdminStaffLoginViewProps> = ({
  initialRole = 'ADMIN',
}) => {
  const { login, initiate2faLogin, verify2faLogin, navigateTo, showToast } = useApp();

  const [activeRole, setActiveRole] = useState<'ADMIN' | 'STAFF'>(initialRole);
  const [email, setEmail] = useState(
    initialRole === 'STAFF' ? 'staff.a@canteen.edu.vn' : 'admin@university.edu.vn'
  );
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2faPending, setIs2faPending] = useState(false);
  const [twoFaRecipient, setTwoFaRecipient] = useState('');
  const [twoFaMaskedRecipient, setTwoFaMaskedRecipient] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);


  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ thông tin tài khoản và mật khẩu', 'warning');
      return;
    }

    setLoading(true);
    try {
      const redirectTarget = activeRole === 'ADMIN' ? 'admin-dashboard' : 'staff-dashboard';
      const success = await login(email.trim(), password, redirectTarget);

      if (!success) {
        // Kiểm tra xem có yêu cầu 2FA không
        try {
          const res = await initiate2faLogin({
            email: email.trim(),
            password,
            preferredChannel: 'EMAIL',
          });
          if (res?.require2FA && res.data) {
            setIs2faPending(true);
            setTwoFaRecipient(res.data.email || email.trim());
            setTwoFaMaskedRecipient(res.data.maskedRecipient || email.trim());
            setCountdown(60);
            showToast(`Mã xác thực 2 lớp đã được gửi tới email ${res.data.maskedRecipient}`, 'info');
          }
        } catch {
          // Fallback handled by toast inside login
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA
  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }

    setLoading(true);
    const redirectTarget = activeRole === 'ADMIN' ? 'admin-dashboard' : 'staff-dashboard';
    const success = await verify2faLogin(twoFaRecipient, otpCode, redirectTarget);
    setLoading(false);
    if (!success) {
      setOtpCode('');
    }
  };

  // Resend 2FA
  const handleResend2fa = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await initiate2faLogin({
        email: email.trim(),
        password,
        preferredChannel: 'EMAIL',
      });
      if (res?.data) {
        setTwoFaMaskedRecipient(res.data.maskedRecipient);
        setCountdown(60);
        setOtpCode('');
        showToast('Đã gửi lại mã xác thực 2FA vào email quản trị!', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi lại mã xác thực', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = activeRole === 'ADMIN';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white font-sans relative overflow-x-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Top Left */}
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[128px] transition-colors duration-700 ${isAdmin ? 'bg-purple-600/20' : 'bg-emerald-600/20'
            }`}
        />
        {/* Glow Bottom Right */}
        <div
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] transition-colors duration-700 ${isAdmin ? 'bg-indigo-600/20' : 'bg-teal-600/20'
            }`}
        />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Bar / Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Uni Canteen Food"
            className="w-12 h-12 rounded-2xl object-contain bg-white p-1 shadow-lg shrink-0 border border-slate-700/60"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">UniCanteen</span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${isAdmin
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
              >
                {isAdmin ? 'Admin Portal' : 'Staff POS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Cổng Đăng Nhập Quản Trị & Vận Hành Bếp
            </p>
          </div>
        </div>
      </header>

      {/* Main Desktop Container (Split Grid) */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 lg:py-12 flex-1 flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-6 xl:col-span-7 space-y-8 select-none">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Quản lý Căn tin & <br />
                <span
                  className={`bg-clip-text text-transparent bg-linear-to-r transition-all duration-500 ${isAdmin
                    ? 'from-purple-400 via-indigo-300 to-sky-400'
                    : 'from-emerald-400 via-teal-300 to-cyan-400'
                    }`}
                >
                  Điều hành Bếp Tập Trung
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Nền tảng kiểm soát thực đơn, điều phối đơn hàng trực tiếp qua màn hình bếp KDS,
                quản lý doanh thu minh bạch và ví điện tử sinh viên toàn trường.
              </p>
            </div>

            {/* Feature Cards Grid (Desktop Highlights) */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Phân Quyền Nghiêm Ngặt</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Chỉ cho phép tài khoản Quản trị viên và Nhân viên hợp lệ truy cập dữ liệu nội bộ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Điều Phối KDS Bếp</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Đồng bộ tức thời từng món ăn từ sinh viên đến bàn chế biến trong 0.2 giây.
                </p>
              </div>
            </div>

            {/* System Metrics Showcase */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-2xl font-black text-white block">04</span>
                <span className="text-xs text-slate-500 font-medium">Căn Tin Hoạt Động</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div>
                <span className="text-2xl font-black text-white block">1,500+</span>
                <span className="text-xs text-slate-500 font-medium">Đơn Hàng Mỗi Ngày</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-800" />
              <div>
                <span className="text-2xl font-black text-white block">99.98%</span>
                <span className="text-xs text-slate-500 font-medium">Uptime Tiêu Chuẩn</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <div className="w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden">
              {/* Title & Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {is2faPending
                      ? 'Xác thực mã 2FA'
                      : isAdmin
                        ? 'Đăng nhập Quản Trị Viên'
                        : 'Đăng nhập Nhân Viên Bếp'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {is2faPending
                    ? `Nhập mã xác thực 6 chữ số gửi tới ${twoFaMaskedRecipient || email}`
                    : isAdmin
                      ? 'Truy cập trung tâm điều hành toàn trường, quản trị căn tin và tài chính.'
                      : 'Truy cập giao diện tiếp nhận đơn, quản lý món ăn và điều phối KDS bếp.'}
                </p>
              </div>

              {/* 2FA Step Form */}
              {is2faPending ? (
                <form onSubmit={handleVerify2fa} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Mã xác thực 6 chữ số
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      Mã hết hạn sau:{' '}
                      <strong className="text-white font-mono">
                        {countdown > 0
                          ? `${Math.floor(countdown / 60)
                            .toString()
                            .padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`
                          : '00:00'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleResend2fa}
                      className="text-purple-400 hover:text-purple-300 font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Gửi lại mã
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer disabled:opacity-50 shadow-lg ${isAdmin
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                  >
                    {loading ? 'Đang xác thực...' : 'Xác Nhận & Đăng Nhập'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIs2faPending(false)}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    ← Quay lại form đăng nhập
                  </button>
                </form>
              ) : (
                /* Primary Login Form (Desktop Spec) */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      {isAdmin ? 'Email Quản Trị Viên' : 'Email Nhân Viên Căn Tin'}
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          isAdmin ? 'admin@university.edu.vn' : 'staff.a@canteen.edu.vn'
                        }
                        className={`w-full py-3 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-hidden transition-all ${isAdmin
                          ? 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                          : 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          }`}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Mật Khẩu
                      </label>
                      <span className="text-[11px] text-slate-500">Mặc định: 123456</span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className={`w-full py-3 pl-10 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-hidden transition-all ${isAdmin
                          ? 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                          : 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-sm bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 cursor-pointer"
                      />
                      <span>Ghi nhớ phiên làm việc trên máy tính này</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all cursor-pointer disabled:opacity-50 shadow-xl flex items-center justify-center gap-2 mt-2 ${isAdmin
                      ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      }`}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Đang xác thực hệ thống...
                      </span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>
                          {isAdmin
                            ? 'Đăng Nhập Cổng Quản Trị Viên'
                            : 'Đăng Nhập Cổng Nhân Viên Bếp'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-900 gap-2">
        <div>
          © 2026 UniCanteen Enterprise Dining Management System. Bảo mật cấp độ cơ sở giáo dục đại học.
        </div>
      </footer>
    </div>
  );
};
