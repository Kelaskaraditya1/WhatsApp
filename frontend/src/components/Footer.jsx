import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-sm">chat</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">ChatConnect</span>
          </Link>

          {/* Links */}
          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-emerald-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-emerald-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-emerald-500 transition-colors">
              Contact
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} ChatConnect. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
