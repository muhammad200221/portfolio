import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Calendar, ExternalLink, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { Certificate } from '../types';
import { CertificateModal } from './CertificateModal';

interface CertificatesSectionProps {
  certificates: Certificate[];
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ certificates }) => {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <section id="certificates" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-semibold shadow-xs">
            <Award className="w-4 h-4 text-amber-500" />
            <span>بڕوانامە و دەستکەوتە ئەکادیمییەکان</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-mono">{certificates.length} بڕوانامە</span>
          </div>

          <h2
            id="certificates-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            بڕوانامە باوەڕپێکراوەکانم
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
            کۆمەڵێک لە بڕوانامە نێودەوڵەتی و خولە تایبەتمەندەکانم لە بوارەکانی گەشەپێدانی سۆفتوێر، دیزاینی ئەزموونی بەکارهێنەر، و ئەندازیاری کلاود.
          </p>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {certificates.map((cert, index) => (
              <motion.article
                key={cert.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.1 }}
                onClick={() => setSelectedCert(cert)}
                className="group bg-white dark:bg-[#0b1120] border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-500/50 dark:hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl dark:shadow-lg dark:hover:shadow-amber-500/5 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Certificate Preview Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {cert.image ? (
                    <img
                      src={cert.image}
                      alt={cert.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-transparent p-6 text-center">
                      <Award className="w-12 h-12 text-amber-500 mb-2 opacity-80" />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {cert.issuer}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                    <span className="text-xs text-white flex items-center gap-1.5 font-medium">
                      <Eye className="w-3.5 h-3.5" />
                      <span>بینینی وردەکارییەکان</span>
                    </span>
                    {cert.credentialUrl && (
                      <span className="text-xs text-amber-300 flex items-center gap-1 font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>پشتڕاستکردنەوە</span>
                      </span>
                    )}
                  </div>

                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-950/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>باوەڕپێکراو</span>
                    </span>
                  </div>

                  {/* Year pill */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>{cert.issueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {cert.title}
                    </h3>

                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{cert.issuer}</span>
                    </p>

                    {cert.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  {/* Skills tags */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {cert.skills.slice(0, 3).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{cert.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 group-hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      <span>بینینی تەواوی بڕوانامە</span>
                    </span>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1 transition-colors"
                        title="پشتڕاستکردنەوە لە ماڵپەڕی سەرەکی"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
            <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              هیچ بڕوانامەیەک بەردەست نییە لە ئێستادا.
            </p>
          </div>
        )}
      </div>

      {/* Selected Certificate Modal */}
      <CertificateModal
        certificate={selectedCert}
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
      />
    </section>
  );
};
