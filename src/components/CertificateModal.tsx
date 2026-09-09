import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Calendar, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';
import { Certificate } from '../types';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyId = () => {
    if (certificate.credentialId) {
      navigator.clipboard.writeText(certificate.credentialId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="certificate-modal-backdrop"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                وردەکاری بڕوانامە و باوەڕپێکراو
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Certificate Image / Preview */}
            {certificate.image && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video group">
                <img
                  src={certificate.image}
                  alt={certificate.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>پشتڕاستکراوە</span>
                </div>
              </div>
            )}

            {/* Title & Issuer */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {certificate.title}
              </h3>
              <p className="text-base font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Award className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>{certificate.issuer}</span>
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>بەرواری وەرگرتن:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{certificate.issueDate}</span>
              </div>

              {certificate.credentialId && (
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium">کۆدی بڕوانامە:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-xs truncate">
                      {certificate.credentialId}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-500 transition-colors"
                    title="لەبەرگرتنەوەی کۆد"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            {certificate.description && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  دەربارەی بڕوانامەکە
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {certificate.description}
                </p>
              </div>
            )}

            {/* Skills */}
            {certificate.skills && certificate.skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  لێهاتووییە پەیوەندیدارەکان
                </h4>
                <div className="flex flex-wrap gap-2">
                  {certificate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                داخستن
              </button>

              {certificate.credentialUrl && (
                <a
                  href={certificate.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>پشتڕاستکردنەوە لە سەرچاوەی سەرەکی</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
