import React from 'react';
import { Heart, Lock, Shield, ArrowUp, LayoutDashboard, Eye, Activity } from 'lucide-react';
import { Profile, SocialLink, AdminUser } from '../types';
import { getSocialIcon } from '../utils/socialIcons';
import { User } from 'firebase/auth';

interface FooterProps {
  profile: Profile;
  socials: SocialLink[];
  user: User | AdminUser | null;
  visitorCount?: number;
  onOpenAdminLogin: () => void;
  onOpenDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  socials,
  user,
  visitorCount,
  onOpenAdminLogin,
  onOpenDashboard,
}) => {
  const activeSocials = socials.filter((s) => s.enabled && s.url);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-slate-950 dark:bg-[#05080f] border-t border-slate-800/80 dark:border-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80 dark:border-slate-900">
          {/* Brand & Short Description (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 overflow-hidden flex-shrink-0">
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  profile.name.charAt(0) || 'م'
                )}
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {profile.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {profile.heroBio}
            </p>
            {/* Social media icons */}
            <div className="flex items-center gap-2 pt-2">
              {activeSocials.map((social) => {
                const IconComponent = getSocialIcon(social.platform);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.title}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              بەشە سەرەکییەکان
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  سەرەکی
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  دەربارەی من
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-white transition-colors">
                  کارەکانم و پڕۆژەکان
                </a>
              </li>
              <li>
                <a href="#socials" className="hover:text-white transition-colors">
                  تۆڕە کۆمەڵایەتییەکان
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  پەیوەندی
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & System Access (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              بەڕێوەبردنی ماڵپەڕ
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              پانێڵی کۆنتڕۆڵ تایبەتە بە بەڕێوەبەری ماڵپەڕ بۆ دەستکاریکردنی پڕۆژەکان، وێنەکان، و زانیارییەکان.
            </p>

            {user ? (
              <button
                onClick={onOpenDashboard}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-600 text-xs font-medium transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>داشبۆردی بەڕێوەبەر</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>چوونەژوورەوەی بەڕێوەبەر</span>
              </button>
            )}

            {/* Live Visitor Counter Badge */}
            <div className="pt-2">
              <div
                id="footer-visitor-badge"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Eye className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-400 font-medium">سەردانیکەران:</span>
                <span className="font-bold text-white bg-slate-800/90 border border-slate-700/60 px-2.5 py-0.5 rounded-lg text-xs tracking-wider">
                  {typeof visitorCount === 'number' && visitorCount > 0
                    ? visitorCount.toLocaleString()
                    : '1'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span>
              هەموو مافەکان پارێزراون © {new Date().getFullYear()} {profile.name}.
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>کۆی سەردانەکان:</span>
              <strong className="text-slate-200 font-semibold">
                {typeof visitorCount === 'number' && visitorCount > 0
                  ? visitorCount.toLocaleString()
                  : '1'}
              </strong>
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>گەڕانەوە بۆ سەرەوە</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
