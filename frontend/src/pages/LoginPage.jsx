import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authAPI';
import { 
  MdPerson, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff, 
  MdRefresh, 
  MdSmartphone,
  MdChat,
  MdDarkMode,
  MdShield,
  MdArrowBack,
  MdPhone
} from 'react-icons/md';

// Google logo SVG component
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.26c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const otpInputRefs = useRef([]);
  
  // Login mode: 'credentials' or 'otp'
  const [loginMode, setLoginMode] = useState('credentials');
  
  // Credentials login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  // Check for existing JWT token on page load
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser(token);
          
          if (response.success && response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/home');
            return;
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('user');
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('tokenType');
          localStorage.removeItem('user');
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, [navigate]);

  // OTP Timer countdown
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Handle credentials login
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(username, password);
      
      if (response.success && response.data) {
        if (response.data.jwtToken) {
          localStorage.setItem('token', response.data.jwtToken);
          localStorage.setItem('tokenType', response.data.tokenType || 'Bearer');
        }
        if (response.data.users) {
          localStorage.setItem('user', JSON.stringify(response.data.users));
        }
        navigate('/home');
      } else {
        setError(response.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.sendOtp(phoneNumber);
      
      if (response.success) {
        setOtpSent(true);
        setOtpTimer(120);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        // Focus first OTP input
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setError(response.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP key down (backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Verify OTP and login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use verifyLoginOtp which returns user + JWT token
      const response = await authAPI.verifyLoginOtp(phoneNumber, otpString);
      
      if (response.success && response.data) {
        // Store JWT token
        if (response.data.jwtToken) {
          localStorage.setItem('token', response.data.jwtToken);
          localStorage.setItem('tokenType', response.data.tokenType || 'Bearer');
        }
        // Store user info
        if (response.data.users) {
          localStorage.setItem('user', JSON.stringify(response.data.users));
        }
        // Navigate to home
        navigate('/home');
      } else {
        setError(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.sendOtp(phoneNumber);
      
      if (response.success) {
        setOtpTimer(120);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(response.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to OTP login mode
  const handleSwitchToOtp = () => {
    setLoginMode('otp');
    setError('');
    setPhoneNumber('');
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
  };

  // Switch back to credentials login
  const handleSwitchToCredentials = () => {
    setLoginMode('credentials');
    setError('');
    setOtpSent(false);
  };

  const handleGoogleLogin = () => {
    authAPI.loginWithGoogle();
  };

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <MdRefresh className="text-emerald-500 text-4xl animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Green Header */}
      <div className="bg-emerald-500 h-32 relative">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <MdDarkMode className="text-white text-xl" />
        </button>
      </div>

      {/* Logo and Title */}
      <div className="flex flex-col items-center -mt-8 mb-6 relative z-10">
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-3">
          <MdChat className="text-emerald-500 text-3xl" />
        </div>
        <h1 className="text-emerald-500 text-xl font-semibold tracking-wide">
          ChatConnect
        </h1>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl p-8">
          
          {/* Credentials Login Mode */}
          {loginMode === 'credentials' && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Please enter your details to sign in.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                      }}
                      placeholder="johndoe"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <MdVisibility className="text-xl" />
                      ) : (
                        <MdVisibilityOff className="text-xl" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <MdRefresh className="text-xl animate-spin" />
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-slate-800 px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-all"
                  >
                    <GoogleLogo />
                    Sign in with Google
                  </button>

                  {/* Mobile Login - Switch to OTP mode */}
                  <button
                    type="button"
                    onClick={handleSwitchToOtp}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 transition-all"
                  >
                    <MdSmartphone className="text-emerald-500 text-xl" />
                    Continue with Mobile
                  </button>
                </div>
              </form>

              {/* Sign Up Link */}
              <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-500 hover:text-emerald-600 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}

          {/* OTP Login Mode */}
          {loginMode === 'otp' && (
            <>
              {/* Header with Back Button */}
              <div className="mb-8">
                <button
                  onClick={handleSwitchToCredentials}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors"
                >
                  <MdArrowBack className="text-xl" />
                  <span className="text-sm font-medium">Back to Login</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {otpSent ? 'Enter OTP' : 'Login with Mobile'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {otpSent 
                    ? `We've sent a 6-digit code to +91${phoneNumber}`
                    : 'Enter your registered phone number to receive an OTP.'
                  }
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Phone Number Form */}
              {!otpSent && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MdPhone className="text-lg" />
                        <span className="text-sm font-medium">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(value);
                          setError('');
                        }}
                        placeholder="Enter your registered phone number"
                        className="w-full pl-20 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Make sure this number is registered with ChatConnect
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <MdRefresh className="text-xl animate-spin" />
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              )}

              {/* OTP Verification Form */}
              {otpSent && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-12 h-14 text-center text-xl font-bold bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    ))}
                  </div>

                  {/* Timer and Resend */}
                  <div className="text-center">
                    {otpTimer > 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Resend OTP in <span className="font-semibold text-emerald-500">{formatTimer(otpTimer)}</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm text-emerald-500 hover:text-emerald-600 font-semibold transition-colors"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Change Number */}
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors"
                  >
                    Change phone number
                  </button>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <MdRefresh className="text-xl animate-spin" />
                    ) : (
                      'Verify & Login'
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="py-6 flex justify-center gap-8 text-xs font-medium text-slate-400 uppercase tracking-wider">
        <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
        <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
        <a href="#" className="hover:text-emerald-500 transition-colors">Help</a>
      </div>

      {/* Decorative Shield Icon */}
      <div className="fixed bottom-8 right-8 opacity-10 pointer-events-none hidden lg:block">
        <MdShield className="text-emerald-500 text-[180px]" />
      </div>
    </div>
  );
};

export default LoginPage;
