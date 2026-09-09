import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Award, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Certificate } from '../../types';
import { uploadImage, createCertificate, updateCertificate } from '../../services/firebase';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  certToEdit: Certificate | null;
  onSaved: () => void;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  certToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState(certToEdit?.title || '');
  const [issuer, setIssuer] = useState(certToEdit?.issuer || '');
  const [issueDate, setIssueDate] = useState(certToEdit?.issueDate || '٢٠٢٣');
  const [credentialId, setCredentialId] = useState(certToEdit?.credentialId || '');
  const [credentialUrl, setCredentialUrl] = useState(certToEdit?.credentialUrl || '');
  const [image, setImage] = useState(certToEdit?.image || '');
  const [description, setDescription] = useState(certToEdit?.description || '');
  const [skillsStr, setSkillsStr] = useState(
    certToEdit?.skills && Array.isArray(certToEdit.skills)
      ? certToEdit.skills.join('، ')
      : typeof certToEdit?.skills === 'string'
      ? (certToEdit.skills as string)
      : ''
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever certToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (certToEdit) {
        setTitle(certToEdit.title || '');
        setIssuer(certToEdit.issuer || '');
        setIssueDate(certToEdit.issueDate || '٢٠٢٣');
        setCredentialId(certToEdit.credentialId || '');
        setCredentialUrl(certToEdit.credentialUrl || '');
        setImage(certToEdit.image || '');
        setDescription(certToEdit.description || '');
        setSkillsStr(
          certToEdit.skills && Array.isArray(certToEdit.skills)
            ? certToEdit.skills.join('، ')
            : typeof certToEdit.skills === 'string'
            ? (certToEdit.skills as string)
            : ''
        );
      } else {
        setTitle('');
        setIssuer('');
        setIssueDate('٢٠٢٣');
        setCredentialId('');
        setCredentialUrl('');
        setImage('');
        setDescription('');
        setSkillsStr('');
      }
      setError(null);
    }
  }, [isOpen, certToEdit]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);
      const url = await uploadImage(file);
      setImage(url);
    } catch {
      setError('هەڵەیەک ڕوویدا لە بارکردنی وێنەی بڕوانامە.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim() || !issueDate.trim()) {
      setError('تکایە ناوی بڕوانامە، دەزگا و بەرواری وەرگرتن پڕبکەرەوە.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const parsedSkills = skillsStr
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const certData: any = {
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate.trim(),
        createdAt: certToEdit?.createdAt || Date.now(),
        credentialId: credentialId.trim(),
        credentialUrl: credentialUrl.trim(),
        image: image.trim(),
        description: description.trim(),
        skills: parsedSkills,
      };

      if (certToEdit) {
        await updateCertificate(certToEdit.id, certData);
      } else {
        await createCertificate(certData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving certificate:', err);
      const msg = err?.message ? `هەڵەیەک لە پاشەکەوتکردندا ڕوویدا: ${err.message}` : 'هەڵەیەک لە پاشەکەوتکردنی بڕوانامەکەدا ڕوویدا.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="certificate-form-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-[#0b1120] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {certToEdit ? 'دەستکاریکردنی بڕوانامە' : 'زیادکردنی بڕوانامەی نوێ'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                ناوی بڕوانامە <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="بۆ نموونە: Meta Front-End Developer Certificate"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Issuer & Issue Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  دەزگا / کۆمپانیا / زانکۆ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="بۆ نموونە: Meta, Google, Harvard..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  بەرواری وەرگرتن <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  placeholder="بۆ نموونە: ٢٠٢٣ یان ئابی ٢٠٢٤"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Credential ID & Verification URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  کۆدی باوەڕپێکراو (Credential ID)
                </label>
                <input
                  type="text"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  placeholder="GCP-ACE-88912..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 dir-ltr text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  لینکی پشتڕاستکردنەوە (Verification URL)
                </label>
                <input
                  type="url"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  placeholder="https://coursera.org/verify/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 dir-ltr text-right"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                وێنەی بڕوانامە یان لۆگۆ
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {image ? (
                  <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                    <img
                      src={image}
                      alt="بڕوانامە"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-44 aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[11px]">هیچ وێنەیەک نییە</span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'باردەکرێت...' : 'بارکردنی وێنەی بڕوانامە'}</span>
                  </button>

                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="یان لینکی وێنە لێرە دابنێ (Image URL)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 dir-ltr text-right"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                لێهاتووییەکانی ئەم بڕوانامەیە (بە فاریزە جیابکرێتەوە)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="React، TypeScript، UI/UX..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                کورتە ڕوونکردنەوە دەربارەی ئەم بڕوانامەیە
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="کورتەیەک دەربارەی بابەت و گرنگی ئەم بڕوانامەیە..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-amber-500 resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>
                    <span>پاشەکەوت دەکرێت...</span>
                  </>
                ) : (
                  <span>{certToEdit ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'زیادکردنی بڕوانامە'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
