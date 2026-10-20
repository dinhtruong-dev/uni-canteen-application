import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  GraduationCap,
  ArrowLeft,
  Check,
} from 'lucide-react';

// ==============================================================================
// COMPONENT: Ô NHẬP MÃ CODE XÁC THỰC (VERIFICATION CODE INPUT - 6 Ô CHUẨN UI)
// ==============================================================================
interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const VerificationCodeInput: React.FC<OtpInputProps> = ({ value, onChange, disabled }) => {
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
    <div className="flex items-center justify-between gap-2 max-w-full my-3">
      {digits.map((digit, idx) => {
        const isCurrentFocus = !digit && (idx === 0 || !!digits[idx - 1]);
        return (
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
            className={`w-12 h-14 sm:w-13 sm:h-15 text-center text-xl font-bold font-mono rounded-2xl transition-all outline-hidden ${
              digit || isCurrentFocus
                ? 'border-2 border-[#4094FA] bg-[#FFFFFF] text-[#000000] shadow-sm'
                : 'border border-transparent bg-[#EFEEF3] text-[#000000] focus:border-[#4094FA] focus:bg-[#FFFFFF]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        );
      })}
    </div>
  );
};

// ==============================================================================
// KHUNG SHELL CHUNG (CONTAINER + HEADER ANIME DARK + SHEET TRẮNG BO TRÒN)
// ==============================================================================
interface AuthShellProps {
  title: string;
  subtitle: string;
  activeTab: 'login' | 'register' | 'forgot';
  onTabChange?: (tab: 'login' | 'register') => void;
  showTabs?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}

const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  activeTab,
  onTabChange,
  showTabs = true,
  onBack,
  children,
}) => {
  return (
    <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:my-8 bg-[#101014] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative font-sans text-slate-800">
      {/* 1. HEADER KHUNG ẢNH ANIME VÀ HIỆU ỨNG TỐI */}
      <div className="relative pt-12 pb-10 px-7 overflow-hidden select-none">
        {/* Ảnh nền Anime tối */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 pointer-events-none transition-transform duration-700"
          style={{ backgroundImage: `url('/images/auth-bg.jpg')` }}
        />

        {/* Lớp phủ Gradient mượt mà từ #101014 */}
        <div className="absolute inset-0 bg-linear-to-b from-[#101014]/60 via-[#101014]/85 to-[#101014] pointer-events-none" />

        {/* Vệt sấm sét / zigzag neon xanh mờ giống ảnh mẫu */}
        <svg
          className="absolute top-5 left-8 w-28 h-36 opacity-35 pointer-events-none text-[#4094FA]"
          viewBox="0 0 100 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 45 8 L 18 42 L 52 74 L 12 112" />
        </svg>

        {/* Nút quay lại nếu có */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="relative z-10 mb-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FFFFFF] flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Logo & Tiêu đề & Phụ đề Header */}
        <div className="relative z-10 mt-2">
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src="/images/logo.png"
              alt="Uni Canteen Food"
              className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <span className="text-base font-black text-white tracking-tight block leading-tight">
                Uni<span className="text-[#4094FA]">Canteen</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Campus Dining
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-[#85858F] font-normal mt-2 leading-relaxed tracking-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. BOTTOM SHEET MÀU TRẮNG BO TRÒN #FFFFFF */}
      <div className="bg-[#FFFFFF] rounded-t-[32px] sm:rounded-t-[36px] px-6 pt-6 pb-8 flex-1 flex flex-col justify-between shadow-[0_-10px_35px_rgba(0,0,0,0.25)] relative z-20">
        <div>
          {/* SEGMENTED CONTROL: [ Đăng nhập ] [ Đăng ký ] */}
          {showTabs && (
            <div className="bg-[#EFEEF3] p-1.5 rounded-[16px] flex items-center mb-6">
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('login')}
                className={`flex-1 py-2.5 rounded-[12px] font-semibold text-sm transition-all text-center cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#101014] text-[#FFFFFF] shadow-sm'
                    : 'text-[#85858F] hover:text-[#000000] bg-transparent'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onTabChange && onTabChange('register')}
                className={`flex-1 py-2.5 rounded-[12px] font-semibold text-sm transition-all text-center cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[#101014] text-[#FFFFFF] shadow-sm'
                    : 'text-[#85858F] hover:text-[#000000] bg-transparent'
                }`}
              >
                Đăng ký
              </button>
            </div>
          )}

          {/* NỘI DUNG FORM CHÍNH */}
          {children}
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// GIAO DIỆN 1: ĐĂNG NHẬP KHÁCH HÀNG (LOGIN VIEW - ĐÚNG MẪU ẢNH 1 & ẢNH 2)
// ==============================================================================
export const LoginView: React.FC = () => {
  const { login, initiate2faLogin, verify2faLogin, navigateTo, viewParams, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Trạng thái xác thực mã OTP / 2FA khi cần (Ảnh 2)
  const [is2faPending, setIs2faPending] = useState(false);
  const [twoFaRecipient, setTwoFaRecipient] = useState('');
  const [twoFaMaskedRecipient, setTwoFaMaskedRecipient] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const nextTarget =
    viewParams?.next ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : '') ||
    '';

  // Đếm ngược gửi lại mã
  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Xử lý đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ email và mật khẩu', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Đăng nhập trực tiếp
      const success = await login(email.trim(), password, nextTarget || undefined);
      if (!success) {
        // Nếu thất bại thử kiểm tra xem có cần 2FA không
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
            showToast(`Mã xác thực đã được gửi tới email ${res.data.maskedRecipient}`, 'info');
          }
        } catch {
          // Bỏ qua nếu lỗi xác thực bình thường
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Email hoặc mật khẩu không chính xác', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Xác thực mã OTP bước 2 (Verify your email)
  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }

    setLoading(true);
    const success = await verify2faLogin(twoFaRecipient, otpCode, nextTarget || undefined);
    setLoading(false);
    if (!success) {
      setOtpCode('');
    }
  };

  // Gửi lại mã xác thực
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
        showToast('Đã gửi lại mã xác thực mới vào email của bạn!', 'info');
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể gửi lại mã xác thực', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={is2faPending ? 'Verify your email' : 'Welcome back'}
      subtitle={
        is2faPending
          ? 'One more step — your next kit is waiting.'
          : 'Pick up where you left off — your kits are waiting.'
      }
      activeTab="login"
      onTabChange={(tab) => {
        if (tab === 'register') navigateTo('register', nextTarget ? { next: nextTarget } : {});
      }}
      onBack={is2faPending ? () => setIs2faPending(false) : undefined}
    >
      {is2faPending ? (
        /* MÀN HÌNH NHẬP MÃ CODE XÁC THỰC (THEO ĐÚNG ẢNH 2) */
        <form onSubmit={handleVerify2fa} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#000000]">Enter verification code</h2>
            <p className="text-xs text-[#85858F] mt-1 leading-relaxed">
              Enter the 6-digit code we sent to{' '}
              <span className="font-semibold text-[#000000]">
                {twoFaMaskedRecipient || email}
              </span>
            </p>
          </div>

          <VerificationCodeInput value={otpCode} onChange={setOtpCode} disabled={loading} />

          <div className="text-xs text-[#85858F] pt-0.5">
            Code expires in{' '}
            <span className="font-semibold text-[#101014]">
              {countdown > 0
                ? `${Math.floor(countdown / 60)
                    .toString()
                    .padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`
                : '00:00'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>

          <div className="text-center text-xs text-[#85858F] pt-2">
            Didn't receive a code?{' '}
            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={handleResend2fa}
              className="text-[#4094FA] font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      ) : (
        /* FORM ĐĂNG NHẬP CHÍNH (THEO ĐÚNG ẢNH 1) */
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          {/* Input Email */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Mail className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email sinh viên"
              required
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          {/* Input Password */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Lock className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-[#85858F] hover:text-[#000000] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Checkbox Ghi nhớ đăng nhập + Link Quên mật khẩu? */}
          <div className="flex items-center justify-between text-xs pt-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4.5 h-4.5 rounded-[5px] flex items-center justify-center transition-all ${
                  rememberMe
                    ? 'bg-[#4094FA] text-[#FFFFFF]'
                    : 'border-2 border-[#A1A1AB] bg-transparent'
                }`}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </span>
              <span className="text-[#85858F] font-medium">Ghi nhớ đăng nhập</span>
            </label>

            <button
              type="button"
              onClick={() => navigateTo('forgot-password')}
              className="text-[#4094FA] font-semibold hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Nút Sign in */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Link chuyển sang Cổng Quản trị & Nhân viên (Desktop) */}
          <div className="pt-3 border-t border-[#EFEEF3] text-center mt-3">
            <button
              type="button"
              onClick={() => navigateTo('admin-login')}
              className="text-xs text-[#85858F] hover:text-[#4094FA] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Cổng Quản Trị & Nhân Viên (Desktop)</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
};

// ==============================================================================
// GIAO DIỆN 2: ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG (REGISTER VIEW - ĐÚNG MẪU ẢNH 3 & ẢNH 2)
// ==============================================================================
export const RegisterView: React.FC = () => {
  const { sendOtp, registerWithOtp, navigateTo, showToast, viewParams } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields theo đúng ảnh 3
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Xác thực OTP
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

  // Gửi OTP khi bấm Sign up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Vui lòng nhập họ và tên của bạn', 'warning');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập email sinh viên hợp lệ', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Mật khẩu phải có tối thiểu 6 ký tự', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Xác nhận mật khẩu không khớp', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách bảo mật', 'warning');
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
      setMaskedEmail(res.maskedRecipient || email.trim());
      setCountdown(60);
      setStep(2);
      showToast(`Đã gửi mã xác thực đến: ${res.maskedRecipient || email.trim()}`, 'success');
    }
  };

  // Xác nhận OTP và tạo tài khoản
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }

    setLoading(true);
    const success = await registerWithOtp(
      {
        name: name.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        phone: phone.trim(),
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

  // Gửi lại mã OTP
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
      setMaskedEmail(res.maskedRecipient || email.trim());
      setCountdown(60);
      setOtpCode('');
      showToast('Đã gửi lại mã xác thực mới vào email của bạn!', 'info');
    }
  };

  return (
    <AuthShell
      title={step === 1 ? 'Create your account' : 'Verify your email'}
      subtitle={
        step === 1
          ? 'Your next kit starts here — join us today.'
          : 'One more step — your next kit is waiting.'
      }
      activeTab="register"
      onTabChange={(tab) => {
        if (tab === 'login') navigateTo('login', nextTarget ? { next: nextTarget } : {});
      }}
      onBack={step === 2 ? () => setStep(1) : undefined}
    >
      {step === 1 ? (
        /* FORM ĐĂNG KÝ (THEO ĐÚNG ẢNH 3) */
        <form onSubmit={handleSignUpSubmit} className="space-y-3">
          {/* 1. Họ và tên */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <User className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ và tên"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          {/* 2. Email sinh viên */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Mail className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email sinh viên"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          {/* 3. Mã sinh viên */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <GraduationCap className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Mã sinh viên"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          {/* 4. Số điện thoại */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Phone className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          {/* 5. Mật khẩu */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Lock className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-[#85858F] hover:text-[#000000] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* 6. Xác nhận mật khẩu */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Lock className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 text-[#85858F] hover:text-[#000000] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Checkbox điều khoản */}
          <div className="flex items-center gap-2.5 pt-1 select-none">
            <span
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`w-4.5 h-4.5 rounded-[5px] shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                agreeTerms
                  ? 'bg-[#4094FA] text-[#FFFFFF]'
                  : 'border-2 border-[#A1A1AB] bg-transparent'
              }`}
            >
              {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </span>
            <label
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="text-xs text-[#85858F] cursor-pointer leading-tight"
            >
              I agree to the{' '}
              <span className="text-[#4094FA] font-medium hover:underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-[#4094FA] font-medium hover:underline">Privacy Policy</span>
            </label>
          </div>

          {/* Nút Sign up */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Processing...' : 'Sign up'}
          </button>
        </form>
      ) : (
        /* MÀN HÌNH NHẬP MÃ XÁC THỰC BƯỚC 2 (THEO ĐÚNG ẢNH 2) */
        <form onSubmit={handleConfirmOtp} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#000000]">Enter verification code</h2>
            <p className="text-xs text-[#85858F] mt-1 leading-relaxed">
              Enter the 6-digit code we sent to{' '}
              <span className="font-semibold text-[#000000]">{maskedEmail || email}</span>
            </p>
          </div>

          <VerificationCodeInput value={otpCode} onChange={setOtpCode} disabled={loading} />

          <div className="text-xs text-[#85858F] pt-0.5">
            Code expires in{' '}
            <span className="font-semibold text-[#101014]">
              {countdown > 0
                ? `${Math.floor(countdown / 60)
                    .toString()
                    .padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`
                : '00:00'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>

          <div className="text-center text-xs text-[#85858F] pt-2">
            Didn't receive a code?{' '}
            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={handleResendOtp}
              className="text-[#4094FA] font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
};

// ==============================================================================
// GIAO DIỆN 3: QUÊN MẬT KHẨU (FORGOT PASSWORD VIEW - ĐỒNG BỘ KHUNG THIẾT KẾ)
// ==============================================================================
export const ForgotPasswordView: React.FC = () => {
  const { navigateTo, showToast, sendOtp, verifyOtp } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Gửi OTP khôi phục mật khẩu
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

  // Xác thực và đổi mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      showToast('Vui lòng nhập đủ 6 chữ số mã xác thực', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
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
    <AuthShell
      title={step === 1 ? 'Reset password' : 'Create new password'}
      subtitle={
        step === 1
          ? 'Enter your student email to receive recovery instructions.'
          : 'Enter the verification code and set your new password.'
      }
      activeTab="forgot"
      showTabs={false}
      onBack={() => {
        if (step === 2) setStep(1);
        else navigateTo('login');
      }}
    >
      {step === 1 ? (
        /* BƯỚC 1: NHẬP EMAIL SINH VIÊN */
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#000000]">Quên mật khẩu</h2>
            <p className="text-xs text-[#85858F] mt-1 leading-relaxed">
              Nhập email sinh viên của bạn để nhận mã xác nhận đặt lại mật khẩu.
            </p>
          </div>

          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Mail className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email sinh viên"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Sending code...' : 'Send recovery code'}
          </button>

          <div className="text-center text-xs text-[#85858F] pt-2">
            Nhớ mật khẩu rồi?{' '}
            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="text-[#4094FA] font-semibold hover:underline cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      ) : (
        /* BƯỚC 2: NHẬP OTP & ĐẶT MẬT KHẨU MỚI */
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div>
            <h2 className="text-lg font-bold text-[#000000]">Enter verification code</h2>
            <p className="text-xs text-[#85858F] mt-1 leading-relaxed">
              Mã xác thực 6 chữ số đã được gửi tới{' '}
              <span className="font-semibold text-[#000000]">{email}</span>
            </p>
          </div>

          <VerificationCodeInput value={otpCode} onChange={setOtpCode} disabled={loading} />

          <div className="flex items-center justify-between text-xs text-[#85858F] pt-0.5">
            <span>
              Code expires in{' '}
              <span className="font-semibold text-[#101014]">
                {countdown > 0
                  ? `${Math.floor(countdown / 60)
                      .toString()
                      .padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`
                  : '00:00'}
              </span>
            </span>

            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={handleSendOTP}
              className="text-[#4094FA] font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              Resend code
            </button>
          </div>

          {/* Mật khẩu mới */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA] mt-2">
            <Lock className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới (≥ 6 ký tự)"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-[#85858F] hover:text-[#000000] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="relative flex items-center bg-[#EFEEF3] rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#4094FA]/25 focus-within:bg-[#FFFFFF] border border-transparent focus-within:border-[#4094FA]">
            <Lock className="w-5 h-5 text-[#85858F] shrink-0 mr-3" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-[#000000] placeholder-[#85858F] pr-8"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 text-[#85858F] hover:text-[#000000] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-[#4094FA] hover:bg-[#3482e3] active:scale-[0.98] text-[#FFFFFF] font-semibold text-sm py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(64,148,250,0.35)] transition-all cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Updating...' : 'Confirm & Reset'}
          </button>
        </form>
      )}
    </AuthShell>
  );
};
