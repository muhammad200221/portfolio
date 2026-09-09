import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  FolderKanban,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Project } from '../../types';
import {
  updateProjectCategories,
  renameProjectCategory,
  deleteProjectCategory,
  DEFAULT_PROJECT_CATEGORIES,
} from '../../services/firebase';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  projects: Project[];
  onCategoriesUpdated?: () => void;
}

const QUICK_SUGGESTIONS = [
  'مۆبایل ئەپ',
  'وێبسایت',
  'سیستەم و نەرمەکاڵا',
  'دیزاینی UI/UX',
  'براندینگ و ناسنامە',
  'گرافیک دیزاین',
  'فۆتۆگرافی و ڤیدیۆ',
  'کۆدی سەرچاوەکراوە',
  'هۆشی دەستکرد (AI)',
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  projects,
  onCategoriesUpdated,
}) => {
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate project count for each category
  const getProjectCount = (categoryName: string) => {
    return projects.filter((p) => p.category === categoryName).length;
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => {
      setStatusMsg(null);
    }, 3500);
  };

  // Add new category
  const handleAddCategory = async (catName?: string) => {
    const nameToAdd = (catName || newCatInput).trim();
    if (!nameToAdd) return;

    if (categories.some((c) => c.toLowerCase() === nameToAdd.toLowerCase())) {
      showFeedback('error', 'ئەم بەشە پێشتر بوونی هەیە.');
      return;
    }

    try {
      setLoading(true);
      const updated = [...categories, nameToAdd];
      await updateProjectCategories(updated);
      setNewCatInput('');
      showFeedback('success', `بەشی "${nameToAdd}" بە سەرکەوتوویی زیادکرا.`);
      onCategoriesUpdated?.();
    } catch (err: any) {
      showFeedback('error', 'هەڵەیەک ڕوویدا لە زیادکردنی بەش.');
    } finally {
      setLoading(false);
    }
  };

  // Start inline edit
  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditNameInput(cat);
    setConfirmDeleteCat(null);
  };

  // Save renamed category
  const handleSaveRename = async (oldName: string) => {
    const trimmedNew = editNameInput.trim();
    if (!trimmedNew) {
      showFeedback('error', 'تکایە ناوێکی دروست بنووسە.');
      return;
    }

    if (trimmedNew === oldName) {
      setEditingCat(null);
      return;
    }

    if (
      categories.some(
        (c) => c !== oldName && c.toLowerCase() === trimmedNew.toLowerCase()
      )
    ) {
      showFeedback('error', 'بەشێکی تر بەم ناوە بوونی هەیە.');
      return;
    }

    try {
      setLoading(true);
      await renameProjectCategory(oldName, trimmedNew);
      setEditingCat(null);
      showFeedback(
        'success',
        `ناوی بەشەکە بۆ "${trimmedNew}" گۆڕدرا و پڕۆژەکانیشی نوێکرانەوە.`
      );
      onCategoriesUpdated?.();
    } catch (err: any) {
      showFeedback('error', 'هەڵەیەک ڕوویدا لە دەستکاریکردنی بەش.');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (catToDelete: string) => {
    try {
      setLoading(true);
      const fallback = categories.find((c) => c !== catToDelete) || 'وێبسایت';
      await deleteProjectCategory(catToDelete, fallback);
      setConfirmDeleteCat(null);
      showFeedback('success', `بەشی "${catToDelete}" بە سەرکەوتوویی سڕایەوە.`);
      onCategoriesUpdated?.();
    } catch (err: any) {
      showFeedback('error', 'هەڵەیەک ڕوویدا لە سڕینەوەی بەش.');
    } finally {
      setLoading(false);
    }
  };

  // Move category Up or Down
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    try {
      setLoading(true);
      await updateProjectCategories(newOrder);
      onCategoriesUpdated?.();
    } catch (err) {
      showFeedback('error', 'هەڵەیەک ڕوویدا لە ڕێکخستنی ڕیزبەندی.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to default categories
  const handleResetToDefaults = async () => {
    try {
      setLoading(true);
      await updateProjectCategories(DEFAULT_PROJECT_CATEGORIES);
      showFeedback('success', 'بەشەکان گەڕێنرانەوە بۆ دۆخی سەرەتایی.');
      onCategoriesUpdated?.();
    } catch (err) {
      showFeedback('error', 'هەڵەیەک ڕوویدا لە گەڕاندنەوە بۆ سەرەتا.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="category-manager-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-[#0e1526] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden text-right"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  دەستکاریکردنی بەشەکانی پڕۆژە
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  زیادکردن، گۆڕینی ناو، ڕیزبەندی، و سڕینەوەی پۆلێنەکانی پڕۆژە
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Status */}
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800/60 text-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </motion.div>
          )}

          {/* Add New Category Form */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              زیادکردنی بەشێکی نوێ (New Category)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="ناوی بەش بنووسە... (وەک: مۆبایل ئەپ، وێبسایت، گرافیک دیزاین)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b1120] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => handleAddCategory()}
                disabled={loading || !newCatInput.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>زیادکردن</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>پێشنیارە خێراکان بۆ زیادکردن بە یەک کلیک:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.filter(
                  (s) => !categories.some((c) => c.toLowerCase() === s.toLowerCase())
                ).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddCategory(suggestion)}
                    disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-800/60 border border-slate-700/60 text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 opacity-60" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Current Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>لیستی بەشە چالاکەکان ({categories.length} بەش)</span>
              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                title="گەڕاندنەوە بۆ لیستی سەرەتایی پێشوەختە"
              >
                <RotateCcw className="w-3 h-3" />
                <span>گەڕاندنەوەی بنەڕەتی</span>
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {categories.map((cat, idx) => {
                const projectCount = getProjectCount(cat);
                const isEditing = editingCat === cat;
                const isConfirmingDelete = confirmDeleteCat === cat;

                return (
                  <div
                    key={cat}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    {/* Category Title / Edit Input */}
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveRename(cat);
                            }
                            if (e.key === 'Escape') {
                              setEditingCat(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#0b1120] border border-indigo-500 text-white text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(cat)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>پاشەکەوت</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                        >
                          پەشیمانبوونەوە
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveCategory(idx, 'up')}
                            disabled={idx === 0 || loading}
                            title="بۆ سەرەوە"
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition-colors"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCategory(idx, 'down')}
                            disabled={idx === categories.length - 1 || loading}
                            title="بۆ خوارەوە"
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 hover:text-white transition-colors"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{cat}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 font-medium flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>{projectCount} پڕۆژە</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1.5 justify-end">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 p-1 rounded-xl">
                            <span className="text-[11px] text-rose-300 px-1">
                              دڵنیایت؟
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              disabled={loading}
                              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                            >
                              بەڵێ، بسڕەوە
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCat(null)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                            >
                              نەخێر
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              disabled={loading}
                              title="دەستکاریکردن و گۆڕینی ناو"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="hidden sm:inline">گۆڕینی ناو</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCat(cat)}
                              disabled={loading}
                              title="سڕینەوەی ئەم بەشە"
                              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              * هەر گۆڕانکارییەک دەیکەیت، دەستبەجێ لەسەر پۆرتفۆلیۆکەت دەردەکەوێت.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              تەواو (داخستن)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
