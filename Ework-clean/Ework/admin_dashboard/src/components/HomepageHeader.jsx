import React, { useState, useEffect } from 'react';
import { Navigation, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#' },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'solutions', label: 'Solutions', href: '#solutions' },
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'mobile-app', label: 'Mobile App', href: '#mobile-app' },
  { id: 'about-us', label: 'About Us', href: '#about-us' },
];

export default function HomepageHeader({ onLoginClick, onSignUpClick, onGetStartedClick, onOpenResourceModal, darkMode = false, onToggleTheme }) {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleSignUp = onSignUpClick || onGetStartedClick;

  // Monitor scroll position to indicate active section in header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      const sectionElements = NAV_LINKS.map(link => {
        if (link.href === '#') return { id: 'home', top: 0 };
        const el = document.querySelector(link.href);
        return {
          id: link.id,
          top: el ? el.offsetTop : Infinity,
        };
      }).filter(Boolean);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        if (scrollPosition >= sectionElements[i].top) {
          setActiveSection(sectionElements[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    setActiveSection(link.id);
    setMobileMenuOpen(false);

    if (link.id === 'about-us' && onOpenResourceModal) {
      onOpenResourceModal('about');
      return;
    }

    if (link.href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', window.location.pathname);
    } else {
      const targetElement = document.querySelector(link.href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', link.href);
      }
    }
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md h-20 transition-colors border-b ${
      darkMode
        ? 'bg-slate-950/95 border-slate-800/80 shadow-[0_4px_20px_0_rgba(0,0,0,0.5)]'
        : 'bg-white/95 border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]'
    }`}>
      <div className="w-full h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        
        {/* LEFT: E-Workforce Logo pinned to the far left corner */}
        <div 
          className="flex items-center cursor-pointer select-none py-1 group shrink-0 mr-6 lg:mr-10"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setActiveSection('home');
          }}
          title="E-WorkForce Home"
        >
          <img 
            src={darkMode ? "/logo-dark.png?v=3" : "/logo.png?v=3"} 
            alt="E-WorkForce" 
            className="h-10 sm:h-12 lg:h-13 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </div>

        {/* CENTER: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-5 lg:space-x-7 max-w-3xl mx-auto">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`text-sm font-medium transition-colors relative py-1 shrink-0 ${
                  isActive
                    ? 'text-blue-500 font-semibold'
                    : darkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </a>
            );
          })}
        </nav>

        {/* RIGHT: Desktop Theme Switch, Login & Sign Up Buttons */}
        <div className="hidden md:flex items-center space-x-3.5 shrink-0 ml-6 lg:ml-10">
          {onToggleTheme && (
            <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <button
            onClick={onLoginClick}
            className={`text-sm font-semibold px-3 py-2 transition-colors cursor-pointer ${
              darkMode ? 'text-slate-200 hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'
            }`}
          >
            Login
          </button>
          
          <button
            onClick={handleSignUp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
          >
            Sign Up
          </button>
        </div>

        {/* MOBILE: Theme Toggle & Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {onToggleTheme && (
            <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} compact={true} />
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              darkMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN / SLIDE-DOWN NAVIGATION */}
      {mobileMenuOpen && (
        <div className={`md:hidden absolute top-20 left-0 right-0 border-b shadow-2xl px-5 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200 ease-out z-50 ${
          darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200/90 text-slate-800'
        }`}>
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500/15 text-blue-500 font-semibold'
                      : darkMode
                      ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginClick();
              }}
              className={`w-full py-2.5 rounded-xl border font-semibold text-sm transition-colors text-center cursor-pointer ${
                darkMode ? 'border-slate-800 text-slate-200 hover:bg-slate-900' : 'border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignUp && handleSignUp();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors text-center cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
