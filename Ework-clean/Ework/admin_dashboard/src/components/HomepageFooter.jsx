import React from 'react';
import { Navigation } from 'lucide-react';

export default function HomepageFooter({ onOpenResourceModal, onOpenSuperAdmin, darkMode = false }) {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (targetId === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', window.location.pathname);
      return;
    }
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', targetId);
    }
  };

  return (
    <footer className={`border-t transition-colors ${
      darkMode 
        ? 'bg-[#080c14] border-slate-800/80 text-slate-300' 
        : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10">
          
          {/* COLUMN 1 — BRAND (Spans 4 cols on desktop) */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div 
              className="flex items-center cursor-pointer select-none"
              onClick={(e) => handleSmoothScroll(e, '#')}
              title="E-WorkForce Home"
            >
              <img 
                src={darkMode ? "/logo-dark.png?v=3" : "/logo.png?v=3"} 
                alt="E-WorkForce Logo" 
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Smarter workforce management. Better operational control.
            </p>

            {/* Social Links (only actual URLs configured) */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white text-slate-400' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:text-blue-600 text-slate-600 shadow-xs'
                }`}
                aria-label="GitHub Repository"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white text-slate-400' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:text-blue-600 text-slate-600 shadow-xs'
                }`}
                aria-label="Twitter / X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:text-white text-slate-400' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:text-blue-600 text-slate-600 shadow-xs'
                }`}
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2 — PRODUCT (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#solutions" 
                  onClick={(e) => handleSmoothScroll(e, '#solutions')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Workforce Management
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Task Management
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Live Tracking
                </a>
              </li>
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleSmoothScroll(e, '#features')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors"
                >
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 — COMPANY (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenResourceModal('about')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenResourceModal('contact')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenResourceModal('careers')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Careers</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30">
                    Hiring
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 — RESOURCES (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenResourceModal('help')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Help Centre
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenResourceModal('documentation')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Documentation
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenResourceModal('help')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 5 — LEGAL (2 cols) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenResourceModal('privacy')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenResourceModal('terms')}
                  className="hover:text-blue-600 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className={`border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 ${
          darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-700'
        }`}>
          <div>
            &copy; {currentYear} E-Workforce Inc. All rights reserved.
          </div>

          {/* Bottom Footer Links */}
          <div className="flex items-center space-x-6 text-xs">
            <button 
              onClick={() => onOpenResourceModal('privacy')}
              className="hover:text-blue-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-400 dark:text-slate-700">&bull;</span>
            <button 
              onClick={() => onOpenResourceModal('terms')}
              className="hover:text-blue-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-400 dark:text-slate-700">&bull;</span>
            <button 
              onClick={() => onOpenResourceModal('contact')}
              className="hover:text-blue-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Support
            </button>
            {onOpenSuperAdmin && (
              <>
                <span className="text-slate-400 dark:text-slate-700">&bull;</span>
                <button 
                  onClick={onOpenSuperAdmin}
                  className="hover:text-purple-400 text-purple-600 dark:text-purple-400 font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1"
                  title="Open Super Admin Management Console"
                >
                  <span>Super Admin</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
