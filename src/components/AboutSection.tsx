import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  CheckCircle,
  Sparkles,
  Download,
  Terminal,
  Award,
  Wrench,
  Layers,
} from 'lucide-react';
import { Profile } from '../types';
import { getSkillIconComponent } from './SkillIcon';

interface AboutSectionProps {
  profile: Profile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const ratedSkills = (profile.skills || []).filter((s) => s.hasRating !== false);
  const unratedSkills = (profile.skills || []).filter((s) => s.hasRating === false);

  const RatedIcon = getSkillIconComponent(profile.ratedSkillsIcon, 'terminal');
  const UnratedIcon = getSkillIconComponent(profile.unratedSkillsIcon, 'wrench');
  const ratedTitle = profile.ratedSkillsTitle || 'شارەزاییە سەرەکییەکان (بە نمرە)';
  const unratedTitle = profile.unratedSkillsTitle || 'ئامراز و بەهرەکانی تر (بێ نمرە)';
  return (
    <section id="about" className="py-20 bg-slate-100/60 dark:bg-slate-950/40 relative">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b0d_1px,transparent_1px),linear-gradient(to_bottom,#64748b0d_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with fade-in-up */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300" />
            <span>ناسینی زیاتر</span>
          </div>
          <h2
            id="about-section-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            دەربارەی من
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            پوختەیەک لە ئەزموونی کارکردن، لێهاتووییەکان و گەشتی گەشەپێدانم
          </p>
        </motion.div>

        {/* Main Grid: Left Profile Card, Right Bio & Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card & Quick Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Photo & Quick Title */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg mb-4 bg-slate-200 dark:bg-slate-800 relative">
                  {!photoLoaded && (
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-0" />
                  )}
                  <img
                    id="about-profile-photo"
                    src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    onLoad={() => setPhotoLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 relative z-10 ${
                      photoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => {
                      setPhotoLoaded(true);
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {profile.name}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-1">
                  {profile.title}
                </p>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs mt-2 bg-slate-100 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{profile.city}، {profile.country}</span>
                </div>
              </div>

              {/* Personal Information items */}
              <div className="py-6 space-y-4 text-sm">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-slate-500 dark:text-slate-400">ناونیشان:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{profile.address || `${profile.city}، ${profile.country}`}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-slate-500 dark:text-slate-400">ئیمەیڵ:</span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors dir-ltr"
                  >
                    {profile.email}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-slate-500 dark:text-slate-400">ژمارەی پەیوەندی:</span>
                  <a
                    href={`tel:${profile.phone}`}
                    className="text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors dir-ltr"
                  >
                    {profile.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">دۆخی کار:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {profile.availability}
                  </span>
                </div>
              </div>

              {/* Call to action contact button */}
              <a
                href="#contact"
                className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-900 dark:border-slate-700 transition-colors shadow-xs"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>ناردنی پەیام بۆ من</span>
              </a>
            </div>

            {/* Skills & Tools Box - Divided into two dedicated sections */}
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-7">
              {/* Section 1: Professional Skills with Ratings / Percentages */}
              <div id="skills-with-rating-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RatedIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{ratedTitle}</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 font-medium">
                    {ratedSkills.length} بەهرە
                  </span>
                </div>

                <div className="space-y-3.5" id="rated-skills-list">
                  {ratedSkills.length > 0 ? (
                    ratedSkills.map((skill) => (
                      <div key={skill.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-800 dark:text-slate-200">{skill.name}</span>
                            {skill.category && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                                {skill.category}
                              </span>
                            )}
                          </div>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono dir-ltr font-semibold">{skill.level || 0}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800/80">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level || 0}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
                      هیچ بەهرەیەکی بە نمرە زیاد نەکراوە
                    </p>
                  )}
                </div>
              </div>

              {/* Modern Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

              {/* Section 2: Other Skills & Tools without Ratings */}
              <div id="skills-without-rating-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UnratedIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>{unratedTitle}</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 text-cyan-700 dark:text-cyan-300 font-medium">
                    {unratedSkills.length} ئامراز
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5" id="unrated-skills-list">
                  {unratedSkills.length > 0 ? (
                    unratedSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white">
                          {skill.name}
                        </span>
                        {skill.category && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800/60">
                            {skill.category}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-3 w-full bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
                      ئامراز و لێهاتووییەکانی تر لێرە دەردەکەون کە پێویستیان بە نمرە نییە
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Biography & Experience Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Biography Section */}
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-4">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>کورتەیەک دەربارەی ژیانم</span>
              </h3>
              <div className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed space-y-4">
                <p id="about-bio-paragraph" className="whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 mb-6">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>ئەزموون و پێشینەی کارکردن</span>
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800/80">
                {profile.experiences && profile.experiences.length > 0 ? (
                  profile.experiences.map((exp) => (
                    <div key={exp.id} className="relative pr-9 space-y-2 group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute right-1.5 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#0b1120] transition-transform group-hover:scale-125 ${
                          exp.current
                            ? 'bg-emerald-500 dark:bg-emerald-400 ring-4 ring-emerald-500/20'
                            : 'bg-indigo-600 dark:bg-indigo-500 ring-4 ring-indigo-500/20'
                        }`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {exp.role}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-1 rounded-full">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{exp.period}</span>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {exp.company}
                      </p>

                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    هیچ ئەزموونێک زیاد نەکراوە
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
