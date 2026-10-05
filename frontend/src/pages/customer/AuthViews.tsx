import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Utensils,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Building2,
  KeyRound,
  ShieldAlert,
  Inbox,
} from 'lucide-react';

// ==============================================================================
// COMPONENT: Ô NHẬP MÃ OTP 6 CHỮ SỐ THÔNG MINH
// ==============================================================================
interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const OtpSixDigitsInput: React.FC<OtpInputProps> = ({ value, onChange, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array(6)
    .fill('')
    .map((_, i) => value[i] || '');

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (val.length > 1) {
      const pasted = val.slice(0, 6);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = val[val.length - 1];
    onChange(newDigits.join(''));

    if (index < 5 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border-2 transition-all outline-hidden ${
            digit
              ? 'border-orange-500 bg-orange-50/50 text-slate-900 shadow-sm shadow-orange-500/20'
              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
};

// ==============================================================================
// GIAO DIỆN 1: ĐĂNG NHẬP KHÁCH HÀNG (XÁC THỰC EMAIL BẢO MẬT THẬT)
// ==============================================================================
export const LoginView: React.FC = () => {
  const {
    login,
    initiate2faLogin,
    verify2faLogin,
    sendOtp,
    loginWithOtp,
    navigateTo,
    viewParams,
    showToast,
  } = useApp();

  // Chế độ đăng nhập: 'PASSWORD_2FA' hoặc 'QUICK_OTP'
  const [loginMode, setLoginMode] = useState<'PASSWORD_2FA' | 'QUICK_OTP'>('PASSWORD_2FA');

  // Đăng nhập mật khẩu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Bước 2FA Email
  const [is2faPending, setIs2faPending] = useState(false);
  const [twoFaRecipient, setTwoFaRecipient] = useState('');
  const [twoFaMaskedRecipient, setTwoFaMaskedRecipient] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Đăng nhập nhanh bằng Email OTP
  const [quickEmail, setQuickEmail] = useState('');
  const [quickOtpSent, setQuickOtpSent] = useState(false);
  const [quickMasked, setQuickMasked] = useState('');

  // Đếm ngược gửi lại mã qua Email
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const nextTarget =
    viewParams?.next ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : '') ||
    '';

  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Xử lý bước 1: Đăng nhập mật khẩu và gửi OTP bảo mật thật vào Email
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
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
        showToast(`Hệ thống đã gửi mã OTP xác thực bảo mật đến email ${res.data.maskedRecipient}`, 'info');
      } else {
        await login(email.trim(), password, nextTarget || undefined);
      }
    } catch (err: any) {
      showToast(err?.message || 'Email hoặc mật khẩu không chính xác', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã OTP 2FA từ Email
  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP nhận được từ email', 'warning');
      return;
    }

    setLoading(true);
    const success = await verify2faLogin(twoFaRecipient, otpCode, nextTarget || undefined);
    setLoading(false);
    if (!success) {
      setOtpCode('');
    }
  };

  // Gửi lại mã OTP qua Email
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
        showToast('Đã gửi lại mã OTP mới vào hộp thư email của bạn!', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi lại mã OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gửi mã OTP đăng nhập nhanh qua Email
  const handleSendQuickOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail.trim()) return;

    setLoading(true);
    const res = await sendOtp({
      recipient: quickEmail.trim(),
      channel: 'EMAIL',
      type: 'LOGIN',
    });
    setLoading(false);

    if (res) {
      setQuickOtpSent(true);
      setQuickMasked(res.maskedRecipient);
      setCountdown(60);
      showToast(`Đã gửi mã xác thực đăng nhập đến ${res.maskedRecipient}`, 'success');
    }
  };

  // Xác thực OTP đăng nhập nhanh
  const handleVerifyQuickOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP nhận được trong email', 'warning');
      return;
    }

    setLoading(true);
    const success = await loginWithOtp(quickEmail.trim(), otpCode, nextTarget || undefined);
    setLoading(false);
    if (!success) {
      setOtpCode('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-12">
        {/* CỘT TRÁI: BANNER BẢO MẬT EMAIL */}
        <div className="relative bg-linear-to-br from-orange-600 via-amber-600 to-amber-700 text-white p-8 flex flex-col justify-between hidden md:flex md:col-span-5">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800')`,
            }}
          />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-black text-xl shadow-lg mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-amber-200 font-extrabold text-[11px] uppercase tracking-widest block">
              UniEat Security Center
            </span>
            <h2 className="text-2xl font-black mt-2 leading-tight">
              Xác Thực Bảo Mật <br />
              <span className="text-amber-200">Qua Email Sinh Viên</span>
            </h2>
          </div>

          <div className="relative z-10 space-y-3.5 text-xs text-orange-100">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-amber-300" />
              </div>
              <span>Gửi thư xác thực OTP tự động đến Email sinh viên trường</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
              </div>
              <span>Lưu trữ phiên xác thực an toàn trên hệ thống Redis Cache</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
              </div>
              <span>Bảo vệ số dư Ví Sinh Viên và thông tin cá nhân của bạn</span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM ĐĂNG NHẬP */}
        <div className="p-6 sm:p-8 md:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 md:hidden">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-lg text-slate-900">UniEat</span>
              </div>

              {!is2faPending && !quickOtpSent && (
                <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('PASSWORD_2FA');
                      setOtpCode('');
                    }}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      loginMode === 'PASSWORD_2FA'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mật khẩu + Xác thực Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode('QUICK_OTP');
                      setOtpCode('');
                    }}
                    className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      loginMode === 'QUICK_OTP'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đăng nhập bằng Email OTP
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {is2faPending || quickOtpSent ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-orange-600" />
                  Xác Thực Mã Email OTP
                </>
              ) : loginMode === 'PASSWORD_2FA' ? (
                'Đăng Nhập Khách Hàng'
              ) : (
                'Đăng Nhập Nhanh Qua Email'
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {is2faPending
                ? `Mã bảo mật 6 chữ số đã được gửi tới hộp thư: ${twoFaMaskedRecipient}`
                : quickOtpSent
                ? `Mã xác thực đã được gửi tới hộp thư: ${quickMasked}`
                : loginMode === 'PASSWORD_2FA'
                ? 'Nhập tài khoản email trường và mật khẩu để xác minh đăng nhập'
                : 'Nhập địa chỉ email trường để nhận mã OTP đăng nhập tức thì'}
            </p>

            {nextTarget && !is2faPending && !quickOtpSent && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Bạn sẽ được tự động chuyển tiếp tới trang đã chọn sau khi đăng nhập.</span>
              </div>
            )}
          </div>

          {/* 1. MÀN HÌNH NHẬP MÃ OTP 2FA EMAIL */}
          {is2faPending ? (
            <form onSubmit={handleVerify2fa} className="space-y-5 text-xs">
              <div className="p-4 bg-orange-50/80 border border-orange-200/90 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-extrabold text-slate-900 block text-[13px]">
                    Kiểm tra hộp thư Email sinh viên
                  </span>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Hệ thống đã gửi mã OTP bảo mật 6 chữ số tới: <strong className="text-slate-900 font-bold">{twoFaMaskedRecipient}</strong>.
                    Vui lòng mở ứng dụng Email hoặc webmail để lấy mã.
                  </p>
                  <div className="mt-2 text-[11px] text-amber-800 font-medium">
                    💡 Mẹo: Nếu chưa thấy trong Hộp thư đến, vui lòng kiểm tra thêm mục Spam/Thư rác.
                  </div>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-2 text-center text-xs">
                  Nhập mã xác thực 6 chữ số:
                </label>
                <OtpSixDigitsInput value={otpCode} onChange={setOtpCode} disabled={loading} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIs2faPending(false)}
                  className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Đổi tài khoản khác
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleResend2fa}
                  className="font-extrabold text-orange-600 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã vào Email'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang xác thực mã OTP...' : 'Xác Thực & Đăng Nhập Ngay'}
              </button>
            </form>
          ) : loginMode === 'PASSWORD_2FA' ? (
            /* 2. FORM ĐĂNG NHẬP MẬT KHẨU BAN ĐẦU */
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email sinh viên / đăng nhập:</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyen.van.a@st.university.edu.vn"
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
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  Hệ thống tự động kích hoạt bảo mật 2 lớp gửi mã OTP tới email của bạn.
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                  <input type="checkbox" defaultChecked className="rounded-md text-orange-600" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigateTo('forgot-password')}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Đang gửi mã vào email...' : 'Tiếp Tục & Gửi Mã Xác Thực Email'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* 3. ĐĂNG NHẬP NHANH BẰNG EMAIL OTP */
            <div className="space-y-4 text-xs">
              {!quickOtpSent ? (
                <form onSubmit={handleSendQuickOtp} className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email sinh viên:</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        placeholder="sinhvien@st.university.edu.vn"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-hidden focus:border-orange-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Hệ thống sẽ gửi mã xác thực 6 chữ số trực tiếp vào hòm thư này.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Đang gửi thư...' : 'Gửi Mã Xác Thực Đến Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyQuickOtp} className="space-y-4">
                  <div className="p-4 bg-orange-50/80 border border-orange-200/90 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-extrabold text-slate-900 block text-[13px]">
                        Kiểm tra thư Email
                      </span>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        Mã OTP đăng nhập đã được gửi tới: <strong className="text-slate-900 font-bold">{quickMasked}</strong>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-2 text-center text-xs">
                      Nhập mã 6 chữ số nhận được từ Email:
                    </label>
                    <OtpSixDigitsInput value={otpCode} onChange={setOtpCode} disabled={loading} />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setQuickOtpSent(false)}
                      className="inline-flex items-center gap-1 font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Đổi email khác
                    </button>

                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendQuickOtp}
                      className="font-extrabold text-orange-600 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? 'animate-spin' : ''}`} />
                      {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã vào Email'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Chưa có tài khoản sinh viên?{' '}
            <button
              type="button"
              onClick={() => navigateTo('register', nextTarget ? { next: nextTarget } : {})}
              className="text-orange-600 font-extrabold hover:underline cursor-pointer"
            >
              Đăng ký tài khoản sinh viên (+Tặng 50.000đ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// GIAO DIỆN 2: ĐĂNG KÝ TÀI KHOẢN SINH VIÊN (XÁC THỰC EMAIL THẬT)
// ==============================================================================
export const RegisterView: React.FC = () => {
  const { sendOtp, registerWithOtp, navigateTo, showToast, viewParams } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
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

  // Bước 2: OTP Email
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const nextTarget =
    viewParams?.next ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : '') ||
    '';

  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Gửi mã OTP vào Email sinh viên khi hoàn thành Bước 1
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showToast('Mật khẩu bảo mật phải có tối thiểu 6 ký tự!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng cung cấp địa chỉ email sinh viên hợp lệ', 'error');
      return;
    }

    setLoading(true);
    const res = await sendOtp({
      recipient: email.trim(),
      channel: 'EMAIL',
      type: 'REGISTER',
    });
    setLoading(false);

    if (res) {
      setMaskedEmail(res.maskedRecipient);
      setCountdown(60);
      setStep(2);
      showToast(`Đã gửi thư xác thực OTP đến: ${res.maskedRecipient}`, 'success');
    }
  };

  // Gửi lại mã OTP qua Email
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    const res = await sendOtp({
      recipient: email.trim(),
      channel: 'EMAIL',
      type: 'REGISTER',
    });
    setLoading(false);

    if (res) {
      setMaskedEmail(res.maskedRecipient);
      setCountdown(60);
      setOtpCode('');
      showToast('Đã gửi lại mã OTP mới vào hộp thư email sinh viên của bạn!', 'info');
    }
  };

  // Xác nhận OTP và tạo tài khoản
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP nhận được trong email', 'warning');
      return;
    }

    setLoading(true);
    const success = await registerWithOtp(
      {
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department,
        className,
        password,
        otpCode,
        channel: 'EMAIL',
      },
      nextTarget || undefined
    );
    setLoading(false);

    if (!success) {
      setOtpCode('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 max-w-xl w-full space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-xs uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              Đăng Ký Xác Thực Email Sinh Viên
            </span>
            <span className="text-xs font-bold text-slate-400">Bước {step} / 2</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Tạo Tài Khoản Sinh Viên' : 'Xác Thực Email Sinh Viên'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Điền thông tin tài khoản. Hệ thống sẽ gửi mã kích hoạt ví (+50.000đ) vào email của bạn.'
              : `Nhập mã xác thực 6 chữ số đã được gửi tới hộp thư: ${maskedEmail}`}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`} />
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleProceedToOtp} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Sinh Viên (MSSV):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="2026001234"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email sinh viên (Nhận mã OTP):</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="a.nguyen@st.university.edu.vn"
                    className="w-full pl-9 pr-3 py-2.5 bg-orange-50/30 border border-orange-300 rounded-xl font-semibold focus:border-orange-500"
                  />
                  <Mail className="w-4 h-4 text-orange-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại liên hệ:</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987 654 321"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Khoa / Viện:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
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
                <label className="font-bold text-slate-700 block mb-1">Mật khẩu (≥ 6 ký tự):</label>
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

            <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="text-[11px] leading-tight">
                Mã xác thực 6 chữ số sẽ được gửi trực tiếp tới hòm thư sinh viên của bạn.
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 font-medium text-slate-600">
              <input type="checkbox" required defaultChecked className="rounded-md text-orange-600" />
              <span>Tôi đồng ý với điều khoản sử dụng và quy định bảo mật hệ thống</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Đang gửi mã tới Email...' : 'Tiếp Tục & Nhận Mã OTP Qua Email (+50.000đ)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="space-y-5 text-xs">
            <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <span className="font-extrabold text-slate-900 block text-[13px]">
                  Kiểm tra hộp thư Email sinh viên
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Để kích hoạt ví sinh viên và tặng ngay 50.000đ, vui lòng nhập mã OTP 6 chữ số đã được gửi tới{' '}
                  <strong className="text-slate-900 font-bold">{maskedEmail}</strong>.
                </p>
                <div className="mt-2 text-[11px] text-amber-800 font-medium">
                  💡 Mẹo: Nếu chưa thấy thư trong Hộp thư đến, vui lòng kiểm tra thư mục Spam hoặc Quảng cáo.
                </div>
              </div>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-2 text-center text-xs">
                Nhập mã OTP 6 chữ số từ Email:
              </label>
              <OtpSixDigitsInput value={otpCode} onChange={setOtpCode} disabled={loading} />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Sửa thông tin email
              </button>

              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                className="font-extrabold text-orange-600 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${countdown > 0 ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã vào Email'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? 'Đang kích hoạt tài khoản...' : 'Xác Thực Email & Kích Hoạt Tài Khoản (+50.000đ)'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Đã có tài khoản sinh viên?{' '}
          <button
            type="button"
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

// ==============================================================================
// GIAO DIỆN 3: QUÊN MẬT KHẨU (XÁC THỰC EMAIL THẬT)
// ==============================================================================
export const ForgotPasswordView: React.FC = () => {
  const { navigateTo, showToast, sendOtp, verifyOtp } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email sinh viên hợp lệ', 'error');
      return;
    }

    setLoading(true);
    const res = await sendOtp({
      recipient: email.trim(),
      channel: 'EMAIL',
      type: 'FORGOT_PASSWORD',
    });
    setLoading(false);

    if (res) {
      setCountdown(60);
      setStep(2);
      showToast('Đã gửi mã xác nhận khôi phục mật khẩu vào email của bạn!', 'success');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã OTP nhận được trong email', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'warning');
      return;
    }

    setLoading(true);
    const valid = await verifyOtp({
      recipient: email.trim(),
      code: otpCode,
      type: 'FORGOT_PASSWORD',
    });
    setLoading(false);

    if (valid) {
      showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.', 'success');
      navigateTo('login');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 max-w-md w-full space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Quên Mật Khẩu</h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? 'Nhập email sinh viên để nhận mã OTP khôi phục mật khẩu'
              : 'Nhập mã OTP từ email và mật khẩu mới'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email sinh viên:</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="an.nguyen22@st.university.edu.vn"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi mã vào email...' : 'Gửi Mã Xác Nhận Đến Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="text-[11px] leading-tight">
                Mã xác thực đã được gửi tới: <strong>{email}</strong>
              </span>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-2 text-center text-xs">
                Mã OTP (6 chữ số):
              </label>
              <OtpSixDigitsInput value={otpCode} onChange={setOtpCode} disabled={loading} />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu mới:</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Đổi email
              </button>
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleSendOTP}
                className="font-extrabold text-orange-600 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã vào Email'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-orange-500 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đặt Lại Mật Khẩu Mới'}
            </button>
          </form>
        )}

        <div className="text-center text-xs">
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};
