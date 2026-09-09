import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginAdmin } from '../services/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('تکایە ئیمەیڵ و وشەی تێپەڕ بنووسە.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginAdmin(email.trim(), password.trim());
      setEmail('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      let errMsg = 'چوونەژوورەوە سەرکەوتوو نەبوو. تکایە لە دروستی ئیمەیڵ و وشەی تێپەڕ دڵنیابەرەوە.';
      if (err.code === 'auth/wrong-password') {
        errMsg = 'وشەی نهێنی (تێپەڕ) هەڵەیە.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'شێوازی ئیمەیڵەکە هەڵەیە.';
      } else if (err.code === 'auth/unauthorized') {
        errMsg = err.message || 'ئەم ئیمەیڵە ڕێگەپێدراو نییە بۆ دەستگەیشتن بەم بەشە.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'هەوڵی زۆر دراوە، تکایە کەمێکی تر دووبارە هەوڵبدەرەوە.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="admin-login-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="fixed inset-0" onClick={handleClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0b1120] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 left-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="داخستن"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              چوونەژوورەوەی بەڕێوەبەر
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              تکایە ئیمەیڵ و وشەی نهێنی تایبەت بە خۆت بنووسە
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                ئیمەیڵی بەڕێوەبەر
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="ئیمەیڵەکەت بنووسە..."
                  autoComplete="email"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors dir-ltr text-right font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                وشەی نهێنی (Password)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors dir-ltr text-right font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'شاردنەوەی وشەی نهێنی' : 'پیشاندانی وشەی نهێنی'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>دەپشکنرێت...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>چوونەژوورەوە</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
