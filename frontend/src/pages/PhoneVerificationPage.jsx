import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authAPI';
import { 
  MdVerifiedUser, 
  MdExpandMore, 
  MdArrowForward, 
  MdArrowBack,
  MdRefresh,
  MdTimer,
  MdEdit
} from 'react-icons/md';

// Country codes list
const countryCodes = [
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'UK', name: 'United Kingdom', dial: '+44' },
  { code: 'BR', name: 'Brazil', dial: '+55' },
  { code: 'FR', name: 'France', dial: '+33' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'AU', name: 'Australia', dial: '+61' },
];

const PhoneVerificationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone Input, 2: OTP Verification
  const [country, setCountry] = useState('IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get selected country dial code
  const getDialCode = () => {
    return countryCodes.find((c) => c.code === country)?.dial || '+91';
  };

  // Get full phone number with country code
  const getFullPhoneNumber = () => {
    return `${getDialCode()}${phoneNumber}`;
  };

  // Handle phone number submit - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Send just the phone number - backend handles country code
      const response = await authAPI.sendOtp(phoneNumber);
      
      if (response.success) {
        setStep(2);
        setTimer(120);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
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

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
      // Send just the phone number - backend handles country code
      const response = await authAPI.verifyOtp(phoneNumber, otpString);
      
      if (response.success) {
        // Store verified phone number in session storage for signup (without country code)
        sessionStorage.setItem('verifiedPhone', phoneNumber);
        sessionStorage.setItem('phoneVerified', 'true');
        // Navigate to signup details page
        navigate('/signup/details');
      } else {
        setError(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Send just the phone number - backend handles country code
      const response = await authAPI.sendOtp(phoneNumber);
      
      if (response.success) {
        setTimer(120);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(response.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle try another number
  const handleTryAnother = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setTimer(120);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <MdVerifiedUser className="text-3xl" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Phone Verification
          </h1>
          
          {/* Tabs */}
          <div className="flex items-center justify-center space-x-8">
            <div 
              className={`pb-3 text-sm font-semibold uppercase tracking-wider cursor-default transition-all ${
                step === 1 
                  ? 'text-emerald-500 border-b-2 border-emerald-500' 
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              1. Phone Input
            </div>
            <div 
              className={`pb-3 text-sm font-semibold uppercase tracking-wider cursor-default transition-all ${
                step === 2 
                  ? 'text-emerald-500 border-b-2 border-emerald-500' 
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              2. OTP Verification
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            // Phone Input View
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8 leading-relaxed">
                Please select your country and enter your mobile number. We will send you an SMS with a 6-digit verification code.
              </p>
              
              <form onSubmit={handleSendOtp} className="space-y-6">
                {/* Country Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Country / Region
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-4 pr-12 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white bg-white dark:bg-slate-700 cursor-pointer transition-all"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.dial})
                        </option>
                      ))}
                    </select>
                    <MdExpandMore className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xl" />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white bg-white dark:bg-slate-700 tracking-wide placeholder-slate-300 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <MdRefresh className="text-xl animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <MdArrowForward className="text-xl" />
                    </>
                  )}
                </button>

                {/* Back to Login */}
                <div className="pt-4 text-center">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors inline-flex items-center"
                  >
                    <MdArrowBack className="text-lg mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            // OTP Verification View
            <div>
              <div className="text-center mb-8">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                  We've sent a 6-digit code to
                </p>
                <p className="text-slate-900 dark:text-white font-bold text-lg">
                  {getFullPhoneNumber()}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                {/* OTP Inputs */}
                <div className="flex justify-between items-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="otp-input w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-100 dark:border-slate-600 w-fit mx-auto">
                  <MdTimer className="text-lg text-emerald-500" />
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Resend code in <span className="text-slate-900 dark:text-white font-bold">{formatTime(timer)}</span>
                  </span>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  {isLoading ? (
                    <MdRefresh className="text-xl animate-spin mx-auto" />
                  ) : (
                    'Verify'
                  )}
                </button>

                {/* Actions */}
                <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || isLoading}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                      canResend 
                        ? 'hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-500 cursor-pointer' 
                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <MdRefresh className="text-xl mb-1" />
                    <span className="text-[11px] uppercase font-bold">Resend OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTryAnother}
                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-700 text-emerald-500 transition-all"
                  >
                    <MdEdit className="text-xl mb-1" />
                    <span className="text-[11px] uppercase font-bold">Try Another</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 p-6 text-center border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            By verifying your number, you agree to our{' '}
            <a href="#" className="text-emerald-500 font-semibold hover:underline">Terms</a> &{' '}
            <a href="#" className="text-emerald-500 font-semibold hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
