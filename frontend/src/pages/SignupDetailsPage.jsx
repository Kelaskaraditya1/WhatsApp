import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authAPI';
import {
  MdChat,
  MdBadge,
  MdMail,
  MdAlternateEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdPhotoCamera,
  MdPerson,
  MdArrowForward,
  MdRefresh,
  MdDarkMode,
  MdLightMode
} from 'react-icons/md';

const SignupDetailsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);

  // Get verified phone from session storage (only on initial load using lazy initialization)
  const [verifiedPhone] = useState(() => sessionStorage.getItem('verifiedPhone') || '');
  const [phoneVerified] = useState(() => sessionStorage.getItem('phoneVerified') === 'true');

  // Redirect if phone not verified (skip if signup is complete)
  useEffect(() => {
    if (!phoneVerified && !signupComplete) {
      navigate('/signup');
    }
  }, [phoneVerified, signupComplete, navigate]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');
    
    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        contact: verifiedPhone,
      };

      const response = await authAPI.signup(signupData, profileImage);
      
      if (response.success) {
        // Store JWT token
        if (response.data?.jwtToken) {
          localStorage.setItem('token', response.data.jwtToken);
          localStorage.setItem('tokenType', response.data.tokenType || 'Bearer');
        }
        // Store user info
        if (response.data?.users) {
          localStorage.setItem('user', JSON.stringify(response.data.users));
        }
        // Navigate to home FIRST, then clear session storage
        // This prevents the useEffect from redirecting back to /signup
        setSignupComplete(true); // Mark signup as complete to prevent redirect
        navigate('/home');
        // Clear session storage after navigation
        sessionStorage.removeItem('verifiedPhone');
        sessionStorage.removeItem('phoneVerified');
      } else {
        setApiError(response.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setApiError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="w-full h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <MdChat className="text-white text-xl" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">ChatConnect</span>
        </Link>
        <div className="flex flex-col items-end">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Step 2 of 2
          </span>
          <div className="flex gap-1 mt-1">
            <div className="h-1.5 w-8 bg-emerald-500 rounded-full"></div>
            <div className="h-1.5 w-8 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 md:p-10 border border-slate-100 dark:border-slate-700">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Create Your Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Let others know who they're talking to.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-slate-50 dark:border-slate-600 overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-opacity">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <MdPerson className="text-5xl text-slate-400 dark:text-slate-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-emerald-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800"
                >
                  <MdPhotoCamera className="text-sm" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <span className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Upload profile photo (optional)
              </span>
              {errors.image && (
                <span className="mt-1 text-xs text-red-500">{errors.image}</span>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <MdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border ${
                      errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white placeholder-slate-400`}
                  />
                </div>
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <MdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border ${
                      errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white placeholder-slate-400`}
                  />
                </div>
                {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
              </div>

              {/* Username */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <div className="relative">
                  <MdAlternateEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe_99"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 border ${
                      errors.username ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white placeholder-slate-400`}
                  />
                </div>
                {errors.username && <span className="text-xs text-red-500">{errors.username}</span>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700/50 border ${
                      errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <MdVisibility className="text-xl" /> : <MdVisibilityOff className="text-xl" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-700/50 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all dark:text-white placeholder-slate-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <MdVisibility className="text-xl" /> : <MdVisibilityOff className="text-xl" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-xs text-red-500">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                }}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                I agree to the{' '}
                <a href="#" className="text-emerald-500 hover:underline font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-500 hover:underline font-medium">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.terms && <span className="text-xs text-red-500">{errors.terms}</span>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <MdRefresh className="text-xl animate-spin" />
              ) : (
                <>
                  <span>Complete Signup</span>
                  <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </main>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        {isDarkMode ? (
          <MdLightMode className="text-yellow-400 text-xl" />
        ) : (
          <MdDarkMode className="text-slate-800 text-xl" />
        )}
      </button>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 dark:text-slate-600">
        © {new Date().getFullYear()} ChatConnect. All rights reserved.
      </footer>
    </div>
  );
};

export default SignupDetailsPage;
