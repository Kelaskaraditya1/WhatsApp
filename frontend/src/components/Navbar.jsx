import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <span className="material-symbols-outlined text-white">chat</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ChatConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-emerald-500 transition-colors">
              Features
            </a>
            <a href="#privacy" className="text-sm font-medium hover:text-emerald-500 transition-colors">
              Privacy
            </a>
            <a href="#help" className="text-sm font-medium hover:text-emerald-500 transition-colors">
              Help
            </a>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-sm font-medium hover:text-emerald-500 transition-colors px-2 py-2">
                Features
              </a>
              <a href="#privacy" className="text-sm font-medium hover:text-emerald-500 transition-colors px-2 py-2">
                Privacy
              </a>
              <a href="#help" className="text-sm font-medium hover:text-emerald-500 transition-colors px-2 py-2">
                Help
              </a>
              <div className="flex items-center gap-4 px-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>
                <Link
                  to="/login"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all text-center"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
