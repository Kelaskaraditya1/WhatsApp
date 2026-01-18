import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// User avatars for social proof
const userAvatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <main className="pt-32 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                New Version 2.0 Available
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6">
                Connecting the{' '}
                <span className="text-emerald-500">world</span>, one message at a time.
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
                Experience lightning-fast messaging with end-to-end encryption. Simple, reliable, and private—available on all your devices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  How it works
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-12 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  {userAvatars.map((avatar, index) => (
                    <img
                      key={index}
                      alt={`User ${index + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                      src={avatar}
                    />
                  ))}
                </div>
                <p>Join over 2 million users worldwide</p>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="relative lg:h-[600px] hidden lg:block">
              <div className="absolute inset-0 hero-pattern opacity-20 dark:opacity-10"></div>
              <div className="relative h-full flex items-center justify-center">
                {/* Phone Frame */}
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-4 border border-slate-100 dark:border-slate-700 transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] h-[540px] overflow-hidden flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 flex items-center justify-between border-b dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-bold">Jane Doe</p>
                          <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-400">more_vert</span>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                        Hey! Have you seen the new ChatConnect design? It's amazing! 🚀
                      </div>
                      <div className="bg-emerald-500 text-white p-3 rounded-2xl rounded-tr-none text-sm ml-auto max-w-[80%]">
                        I just logged in! The end-to-end encryption makes me feel so much safer.
                      </div>
                      <div className="bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                        Exactly! And the dark mode is just perfect for late night chats.
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t dark:border-slate-800 flex gap-2 items-center">
                      <div className="flex-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-400">
                        Type a message...
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white cursor-pointer hover:bg-emerald-600 transition-colors">
                        <span className="material-symbols-outlined text-sm">send</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Security Badge */}
                <div className="absolute top-10 -right-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold">Secure</p>
                      <p className="text-[10px] text-slate-500">End-to-end encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why ChatConnect?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Built for the modern web with performance and privacy as our core pillars.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                <span className="material-symbols-outlined text-3xl">bolt</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Delivery</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Messages reach your contacts in milliseconds, no matter where they are in the world.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Always Secure</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Your conversations are your business. We use state-of-the-art encryption by default.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-500 mb-6">
                <span className="material-symbols-outlined text-3xl">devices</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Device</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Seamlessly switch between your phone, tablet, and desktop without losing a single message.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
