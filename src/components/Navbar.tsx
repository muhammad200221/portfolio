import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Menu, X, Shield, Lock, ExternalLink, Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import { Profile, AdminUser } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  profile: Profile;
  user: User | AdminUser | null;
  onOpenAdminLogin: () => void;
  onOpenDashboard: () => void;
  currentSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  user,
  onOpenAdminLogin,
  onOpenDashboard,
  currentSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'سەرەکی', href: '#hero' },
    { label: 'دەربارەی من', href: '#about' },
    { label: 'کارەکانم', href: '#projects' },
    { label: 'بڕوانامەکان', href: '#certificates' },
    { label: 'تۆڕە کۆمەڵایەتییەکان', href: '#socials' },
    { label: 'پەیوەندی', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-900/5 dark:shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#hero"
          className="flex items-center gap-3 group"
          id="nav-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-slate-100 dark:bg-[#0b1120] rounded-[10px] flex items-center justify-center text-slate-900 dark:text-white font-black text-lg overflow-hidden">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-[10px]"
                  onError={(e) => {
                    // Fallback to initial if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                profile.name.charAt(0) || 'م'
              )}
            </div>
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>{profile.name}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal hidden sm:block">
              {profile.title}
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-xs">
          {navItems.map((item) => (
            <button
              key={item.href}
              id={`nav-link-${item.href.replace('#', '')}`}
              onClick={() => handleNavClick(item.href)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
                currentSection === item.href.replace('#', '')
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons: Theme Toggle, Admin Login & Contact */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Theme Toggle Button (Sun/Moon) */}
          <ThemeToggle id="nav-theme-toggle-desktop" />

          {user ? (
            <button
              id="nav-admin-dashboard-btn"
              onClick={onOpenDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-indigo-600/25 transition-all duration-200 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>داشبۆردی بەڕێوەبەر</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>
          ) : (
            <button
              id="nav-admin-login-btn"
              onClick={onOpenAdminLogin}
              title="چوونەژوورەوەی بەڕێوەبەر"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-500 bg-slate-100/80 dark:bg-slate-900/50 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>چوونەژوورەوە</span>
            </button>
          )}

          <button
            id="nav-contact-cta"
            onClick={() => handleNavClick('#contact')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-900 dark:border-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <span>پەیوەندی</span>
          </button>
        </div>

        {/* Mobile Menu & Theme Controls */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Mobile Theme Toggle */}
          <ThemeToggle id="nav-theme-toggle-mobile" />

          {user ? (
            <button
              id="nav-mobile-dashboard-icon"
              onClick={onOpenDashboard}
              className="p-2 rounded-lg bg-indigo-600 text-white"
              title="داشبۆرد"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="nav-mobile-login-icon"
              onClick={onOpenAdminLogin}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              title="چوونەژوورەوە"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          <button
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="کردنەوەی مینیۆ"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="sm:hidden bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-5 pt-3 pb-6 space-y-3 mt-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="w-full text-right px-4 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium text-sm transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-100/70 dark:bg-slate-900/50">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                گۆڕینی دۆخی ڕەنگەکان:
              </span>
              <ThemeToggle id="nav-theme-toggle-drawer" showLabel />
            </div>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium cursor-pointer shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>داشبۆردی بەڕێوەبەر</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-medium cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>چوونەژوورەوەی بەڕێوەبەر</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

