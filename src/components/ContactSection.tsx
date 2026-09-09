import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Profile, SocialLink } from '../types';
import { sendContactMessage } from '../services/firebase';
import { getSocialIcon } from '../utils/socialIcons';

interface ContactSectionProps {
  profile: Profile;
  socials: SocialLink[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, socials }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('تکایە ناو، ئیمەیڵ، و پەیامەکەت بە تەواوی بنووسە.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || 'پەیامی نوێ لە ماڵپەڕەوە',
        message: message.trim(),
      });

      setSuccessMessage('سوپاس بۆ پەیامەکەت! بە سەرکەوتوویی گەیشت و بە زووترین کات وەڵامت دەدرێتەوە.');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorMessage('کێشەیەک ڕوویدا لە ناردنی پەیامەکە. تکایە دووبارە هەوڵبدەرەوە یان ڕاستەوخۆ لە ڕێگەی ئیمەیڵ پەیوەندی بکە.');
    } finally {
      setLoading(false);
    }
  };

  const activeSocials = socials.filter((s) => s.enabled && s.url);
  const whatsappLink = socials.find((s) => s.platform === 'whatsapp')?.url;

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-slate-100/60 dark:bg-transparent">
      {/* Background glow */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with fade-in-up */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>پەیوەندیکردن</span>
          </div>
          <h2
            id="contact-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            پەیوەندیم پێوە بکە
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            بیرۆکەیەکت هەیە، دەتەوێت دەست بە پڕۆژەیەک بکەین یان پرسیارێکت هەیە؟ بەخۆشحاڵییەوە وەڵامت دەدەمەوە.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Cards & Info (5 cols) with fade-in-up */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Info Card */}
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">زانیاری پەیوەندی</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                دەتوانیت ڕاستەوخۆ لە ڕێگەی زانیارییەکانی خوارەوە یان فۆڕمی پەیوەندییەوە نامەم بۆ بنێریت.
              </p>

              <div className="space-y-4 pt-2">
                {/* Email */}
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors group shadow-xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ئیمەیڵ</div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate dir-ltr text-right">
                      {profile.email}
                    </div>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors group shadow-xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">تەلەفۆن / پەیوەندی</div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors dir-ltr text-right">
                      {profile.phone}
                    </div>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">ناونیشان و شوێن</div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                      {profile.address || `${profile.city}، ${profile.country}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp button if configured */}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>پەیوەندی ڕاستەوخۆ لە ڕێگەی واتسئەپ</span>
                </a>
              )}

              {/* Social icons in contact card */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">تۆڕە کۆمەڵایەتییەکان:</div>
                <div className="flex flex-wrap gap-2">
                  {activeSocials.map((s) => {
                    const IconComp = getSocialIcon(s.platform);
                    return (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center justify-center transition-all shadow-xs"
                      >
                        <IconComp className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Form (7 cols) with fade-in-up */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-xl relative">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                فۆڕمی ناردنی پەیام
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                هەموو خانەکان پڕبکەرەوە و نامەکەت ڕاستەوخۆ دەگاتە دەست من.
              </p>

              {/* Alert Feedback Messages */}
              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" id="portfolio-contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ناوی تەواوت <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="محەمەد ئەحمەد"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-xs"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ئیمەیڵەکەت <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors dir-ltr text-right shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      ژمارەی تەلەفۆن (ئارەزوومەندانە)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+964 7XX XXX XXXX"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors dir-ltr text-right shadow-xs"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      بابەتی پەیام
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="داواکاری پڕۆژە، هاوکاری، هتد..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-xs"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    دەقی پەیام <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="وردەکاری پەیامەکەت لێرە بنووسە..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-colors resize-none leading-relaxed shadow-xs"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="contact-submit-btn"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>تکایە چاوەڕێبە...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ناردنی پەیام</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
