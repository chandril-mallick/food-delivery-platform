import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, LogOut, Phone, Home, Menu, ShoppingCart, Clock } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const { isAuthenticated, user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully');
      navigate('/');
    } else {
      toast.error('Failed to logout');
    }
    setShowUserMenu(false);
  };

  // Typing animation effect
  useEffect(() => {
    const fullText = 'Dabba Bot';
    let currentIndex = 0;
    
    const typeText = () => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
        setTimeout(typeText, 150); // 150ms delay between characters
      } else {
        setIsTyping(false);
        // Restart animation after 3 seconds
        setTimeout(() => {
          currentIndex = 0;
          setIsTyping(true);
          typeText();
        }, 3000);
      }
    };
    
    typeText();
  }, []);

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle body scroll lock and ESC close for mobile drawer
  useEffect(() => {
    if (menuOpen) {
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setMenuOpen(false);
      };
      document.addEventListener('keydown', onKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [menuOpen]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2-$3');
  };

  // Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Haptic feedback simulation for mobile
  const handleMobileNavClick = (path) => {
    // Simulate haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(50); // Short vibration
    }
    
    // Close mobile menu if open
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl px-4 sm:px-8 py-4 flex justify-between items-center relative border-b border-gray-700">
      {/* Logo - Enhanced mobile visibility and desktop elegance */}
      <Link to="/" className="flex items-center space-x-2 group active:scale-95 transition-transform duration-200">
        <div className="relative">
          {/* Logo with enhanced mobile sizing */}
          <img
            src="/logo1.png"
            alt="Dabba - Ghar Jaisa Khana"
            className="h-20 w-20 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-105"
          />
          {/* Subtle glow effect for mobile */}
          <div className="absolute inset-0 bg-orange-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-200 blur-sm -z-10"></div>
        </div>
        <div className="flex flex-col">
          {/* Brand name - visible on all screens with responsive sizing */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200 leading-tight">
            <span>{typedText}</span>
            {isTyping && (
              <span className="animate-pulse text-orange-400 ml-1">|</span>
            )}
          </h1>
          {/* Tagline - hidden on very small screens, visible on larger */}
          <p className="text-xs sm:text-sm text-gray-300 -mt-1 font-medium hidden xs:block md:block flex items-center space-x-1">
            <span className="text-sm"></span>
            <span>Ghar Jaisa Khana</span>
          </p>
        </div>
      </Link>
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <Link to="/" className="text-gray-200 font-semibold text-lg hover:text-orange-400 transition-colors duration-200">Home</Link>
        <Link to="/menu" className="text-gray-200 font-semibold text-lg hover:text-orange-400 transition-colors duration-200">Menu</Link>
        <Link to="/cart" className="text-gray-200 font-semibold text-lg hover:text-orange-400 transition-colors duration-200">Cart</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/order-history" className="text-gray-200 font-semibold text-lg hover:text-orange-400 transition-colors duration-200">Orders</Link>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-200 font-semibold text-lg hover:text-orange-400 transition-colors duration-200 focus:outline-none"
              >
                <User size={20} />
                <span className="hidden lg:inline">
                  {userProfile?.name || formatPhoneNumber(user?.phoneNumber) || 'Profile'}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-50">
                  <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {userProfile?.name || 'User'}
                        </p>
                        <p className="text-sm text-gray-300 flex items-center gap-1">
                          <Phone size={14} />
                          {formatPhoneNumber(user?.phoneNumber)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      to="/order-history"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/account-settings"
                      className="block px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-orange-400 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Account Settings
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-600">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200">
            Login
          </Link>
        )}
      </div>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden flex items-center justify-center text-gray-200 focus:outline-none p-2 rounded-lg hover:bg-gray-700 active:scale-95 transition-all duration-200"
        onClick={() => {
          setMenuOpen(!menuOpen);
          if (navigator.vibrate) navigator.vibrate(30);
        }}
        aria-label="Toggle menu"
      >
        <svg className={`w-6 h-6 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-50 md:hidden transition-opacity duration-200"
            onClick={() => setMenuOpen(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          {/* Drawer */}
          <div
            className="fixed top-0 left-0 h-full w-72 max-w-[85%] bg-gray-900 border-r border-gray-700 shadow-2xl z-[60] md:hidden transform transition-transform duration-300 ease-out translate-x-0"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <img src="/logo1.png" alt="Dabba" className="h-8 w-8 object-contain" />
                <span className="text-white font-semibold text-lg">Dabba bot</span>
              </div>
              <button
                className="p-2 rounded-md text-gray-300 hover:bg-gray-800 active:scale-95 transition"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex flex-col gap-1 p-3">
              <Link to="/" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/menu" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Menu</Link>
              <Link to="/cart" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Cart</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/order-history" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Orders</Link>
                  <Link to="/profile" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <Link to="/account-settings" className="px-3 py-3 rounded-lg text-gray-200 font-semibold hover:bg-gray-800 hover:text-orange-400 transition" onClick={() => setMenuOpen(false)}>Settings</Link>

                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <User size={20} className="text-gray-300" />
                      <span className="text-gray-200 font-medium">
                        {userProfile?.name || formatPhoneNumber(user?.phoneNumber) || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 justify-center px-3 py-2 text-red-400 font-semibold hover:text-red-300 hover:bg-gray-800 rounded-md transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mt-3 mx-3 bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>

    {/* Mobile Bottom Navigation - Polished App-like */}
    {isMobile && (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Floating glass bar */}
        <div className="mx-3 mb-3 rounded-2xl bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.25)] ring-1 ring-white/5 pointer-events-auto">
          <div className="flex justify-around items-center py-2.5 px-2">
          {/* Home */}
          <Link
            to="/"
            onClick={() => handleMobileNavClick('/')}
            className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              isActiveRoute('/')
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
            }`}
          >
            <Home size={22} className={isActiveRoute('/') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
            <span className="text-[10px] font-medium mt-1 tracking-wide">Home</span>
          </Link>

          {/* Menu */}
          <Link
            to="/menu"
            onClick={() => handleMobileNavClick('/menu')}
            className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              isActiveRoute('/menu')
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
            }`}
          >
            <Menu size={22} className={isActiveRoute('/menu') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
            <span className="text-[10px] font-medium mt-1 tracking-wide">Menu</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={() => handleMobileNavClick('/cart')}
            className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              isActiveRoute('/cart')
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
            }`}
          >
            <ShoppingCart size={22} className={isActiveRoute('/cart') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
            <span className="text-[10px] font-medium mt-1 tracking-wide">Cart</span>
          </Link>

          {/* Orders */}
          {isAuthenticated && (
            <Link
              to="/order-history"
              onClick={() => handleMobileNavClick('/order-history')}
              className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActiveRoute('/order-history')
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                  : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
              }`}
            >
              <Clock size={22} className={isActiveRoute('/order-history') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
              <span className="text-[10px] font-medium mt-1 tracking-wide">Orders</span>
            </Link>
          )}

          {/* Profile/Login */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              onClick={() => handleMobileNavClick('/profile')}
              className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActiveRoute('/profile')
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                  : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
              }`}
            >
              <User size={22} className={isActiveRoute('/profile') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
              <span className="text-[10px] font-medium mt-1 tracking-wide">Profile</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => handleMobileNavClick('/login')}
              className={`group flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActiveRoute('/login')
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md ring-1 ring-white/20'
                  : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
              }`}
            >
              <User size={22} className={isActiveRoute('/login') ? 'text-white' : 'text-gray-300 group-hover:text-orange-300'} />
              <span className="text-[10px] font-medium mt-1 tracking-wide">Login</span>
            </Link>
          )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Navbar;
