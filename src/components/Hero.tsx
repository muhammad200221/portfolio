import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  Briefcase,
  User,
  Sparkles,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Profile, SocialLink } from '../types';
import { getSocialIcon } from '../utils/socialIcons';

interface HeroProps {
  profile: Profile;
  socials: SocialLink[];
  onExploreWork: () => void;
  onAboutMe: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  profile,
  socials,
  onExploreWork,
  onAboutMe,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const activeSocials = socials.filter((s) => s.enabled && s.url);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Apply hysteresis to completely prevent rapid scroll toggling / glitching:
          // Activates once user scrolls past 90px
          // Only deactivates when user scrolls back near the top (< 25px)
          setIsScrolled((prev) => {
            if (!prev && scrollY > 90) return true;
            if (prev && scrollY < 25) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[450px] bg-gradient-to-tr from-blue-700/15 via-indigo-600/20 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-indigo-900/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-cyan-900/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Availability Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mb-8 shadow-xs dark:shadow-inner backdrop-blur-sm"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{profile.availability || 'ئامادەم بۆ وەرگرتنی پڕۆژەی نوێ'}</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            {profile.city}، {profile.country}
          </span>
        </motion.div>

        {/* Dynamic Transition Container between Center and Left on Scroll */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.8 }}
          className={`w-full flex flex-col ${
            isScrolled
              ? 'md:flex-row items-center justify-center md:justify-between gap-6 md:gap-12 lg:gap-16'
              : 'items-center justify-center gap-4 text-center'
          }`}
        >
          {/* Profile Photo: Centered on mobile at all times, glides to left only on tablet & desktop on scroll */}
          <motion.div
            layout="position"
            transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.8 }}
            className={`relative flex-shrink-0 mb-4 md:mb-0 ${
              isScrolled
                ? 'order-1 md:order-2 mx-auto md:mx-0'
                : 'order-1 mx-auto'
            }`}
          >
            <div
              className={`rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 mx-auto transition-all duration-500 ease-out ${
                isScrolled
                  ? 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 p-1 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-500/20'
                  : 'w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 p-1.5 sm:p-2 shadow-2xl shadow-indigo-500/35 ring-4 sm:ring-8 ring-indigo-500/25 dark:ring-indigo-400/20'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-950 relative">
                {/* Skeleton placeholder while loading */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-0" />
                )}
                <img
                  id="hero-profile-image"
                  src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-cover transition-all duration-500 hover:scale-105 relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onError={(e) => {
                    setImageLoaded(true);
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 dark:from-slate-950/40 via-transparent to-transparent pointer-events-none z-20" />
              </div>
            </div>

            {/* Verified / Active Status Badge */}
            <div
              id="hero-profile-badge"
              className={`absolute z-30 bg-white dark:bg-[#0b1120] text-emerald-500 dark:text-emerald-400 rounded-full border-2 border-white dark:border-slate-900 shadow-xl flex items-center justify-center pointer-events-none transition-all duration-500 ease-out ${
                isScrolled
                  ? 'bottom-1 -end-1 sm:bottom-1.5 sm:end-0 p-2 sm:p-2.5 ring-2 ring-emerald-500/30'
                  : 'bottom-2 -end-1 sm:bottom-3 sm:end-2 p-3 sm:p-4 ring-4 ring-emerald-500/30'
              }`}
              title="چالاک و پشتڕاستکراو"
            >
              <Sparkles className={`transition-all duration-500 ease-out ${isScrolled ? 'w-4 h-4 sm:w-4.5 sm:h-4.5' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
            </div>
          </motion.div>

          {/* Text, Titles, and CTA Buttons Container */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.8 }}
            className={`w-full ${
              isScrolled
                ? 'order-2 md:order-1 flex-1 text-center md:text-right'
                : 'order-2 max-w-3xl mx-auto text-center'
            }`}
          >
            {/* Name and Title */}
            <div className="space-y-3">
              <h1
                id="hero-name-title"
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
              >
                {profile.name}
              </h1>
              <div className="inline-block">
                <p
                  id="hero-profession"
                  className="text-lg sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-indigo-600 to-blue-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-blue-400"
                >
                  {profile.title}
                </p>
              </div>

              {/* Short Introduction */}
              <p
                id="hero-intro-text"
                className={`text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal pt-2 ${
                  isScrolled ? 'max-w-xl mx-auto md:ms-0' : 'max-w-2xl mx-auto'
                }`}
              >
                {profile.heroBio}
              </p>
            </div>

            {/* CTA Buttons ("دەربارەی من" و "کارەکانم") */}
            <div
              className={`flex flex-wrap items-center gap-4 mt-8 ${
                isScrolled ? 'justify-center md:justify-start' : 'justify-center'
              }`}
            >
              <button
                id="hero-projects-btn"
                onClick={onExploreWork}
                className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Briefcase className="w-5 h-5" />
                <span>کارەکانم</span>
              </button>

              <button
                id="hero-about-btn"
                onClick={onAboutMe}
                className="flex items-center gap-2.5 px-7 py-3 rounded-full bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-medium text-base shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>دەربارەی من</span>
              </button>
            </div>

            {/* Social Media Icons Row */}
            {activeSocials.length > 0 && (
              <div
                className={`mt-8 pt-5 border-t border-slate-200 dark:border-slate-800/60 ${
                  isScrolled ? 'max-w-md mx-auto md:ms-0' : 'max-w-md mx-auto'
                }`}
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                  پەیوەندیم پێوە بکە لە ڕێگەی تۆڕە کۆمەڵایەتییەکان:
                </p>
                <div
                  className={`flex items-center flex-wrap gap-2.5 ${
                    isScrolled ? 'justify-center md:justify-start' : 'justify-center'
                  }`}
                  id="hero-social-links"
                >
                  {activeSocials.map((social) => {
                    const IconComponent = getSocialIcon(social.platform);
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.title}
                        id={`hero-social-${social.platform}`}
                        className="w-10 h-10 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs"
                      >
                        <IconComponent className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80"
        >
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 shadow-xs">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {profile.yearsOfExperience || '٦+ ساڵ'}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {profile.yearsOfExperienceLabel || 'ئەزموونی کارکردن'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 shadow-xs">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {profile.completedProjectsCount || '٤٥+ پڕۆژە'}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {profile.completedProjectsLabel || 'پڕۆژەی تەواوکراو'}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 shadow-xs">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400 tracking-tight">
              ١٠٠٪
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">کوالیتی و دڵنیایی</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
