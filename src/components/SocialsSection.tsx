import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Sparkles, Share2, ArrowUpLeft } from 'lucide-react';
import { SocialLink } from '../types';
import { getSocialIcon } from '../utils/socialIcons';

interface SocialsSectionProps {
  socials: SocialLink[];
}

export const SocialsSection: React.FC<SocialsSectionProps> = ({ socials }) => {
  const activeSocials = socials.filter((s) => s.enabled && s.url);

  return (
    <section id="socials" className="py-20 bg-slate-50 dark:bg-slate-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>پەیوەندی لە تۆڕەکان</span>
          </div>
          <h2
            id="socials-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            تۆڕە کۆمەڵایەتییەکانم
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            دەتوانیت لە ڕێگەی سەرجەم پلاتفۆرمە کۆمەڵایەتییەکان لەگەڵمدا لە پەیوەندیدا بیت
          </p>
        </div>

        {/* Social Cards Grid */}
        <div
          id="social-links-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {activeSocials.map((social, idx) => {
            const IconComponent = getSocialIcon(social.platform);
            return (
              <motion.a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all duration-300 flex items-center justify-between shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                      {social.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">سەردانکردن</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-[-2px] transition-all">
                  <ArrowUpLeft className="w-4 h-4" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
