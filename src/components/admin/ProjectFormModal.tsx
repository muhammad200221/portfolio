import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Link,
  Video,
  Check,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { Project } from '../../types';
import { uploadImage, createProject, updateProject } from '../../services/firebase';
import { CategoryManagerModal } from './CategoryManagerModal';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit: Project | null;
  onSaved: () => void;
  categories?: string[];
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  onSaved,
  categories = [],
}) => {
  const [title, setTitle] = useState(projectToEdit?.title || '');
  const [category, setCategory] = useState(projectToEdit?.category || 'وێبسایت');
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [coverImage, setCoverImage] = useState(projectToEdit?.coverImage || '');
  const [images, setImages] = useState<string[]>(projectToEdit?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [description, setDescription] = useState(projectToEdit?.description || '');
  const [date, setDate] = useState(projectToEdit?.date || '٢٠٢٤');
  const [startDate, setStartDate] = useState(projectToEdit?.startDate || '');
  const [endDate, setEndDate] = useState(projectToEdit?.endDate || '');
  const [locationName, setLocationName] = useState(projectToEdit?.locationName || '');
  const [city, setCity] = useState(projectToEdit?.city || 'سلێمانی');
  const [country, setCountry] = useState(projectToEdit?.country || 'کوردستان');
  const [externalLink, setExternalLink] = useState(projectToEdit?.externalLink || '');
  const [videoLink, setVideoLink] = useState(projectToEdit?.videoLink || '');
  const [featured, setFeatured] = useState(projectToEdit?.featured || false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever projectToEdit, isOpen, or categories change
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setTitle(projectToEdit.title || '');
        setCategory(projectToEdit.category || 'وێبسایت');
        setCoverImage(projectToEdit.coverImage || '');
        setImages(projectToEdit.images || []);
        setDescription(projectToEdit.description || '');
        setDate(projectToEdit.date || '٢٠٢٤');
        setStartDate(projectToEdit.startDate || '');
        setEndDate(projectToEdit.endDate || '');
        setLocationName(projectToEdit.locationName || '');
        setCity(projectToEdit.city || 'سلێمانی');
        setCountry(projectToEdit.country || 'کوردستان');
        setExternalLink(projectToEdit.externalLink || '');
        setVideoLink(projectToEdit.videoLink || '');
        setFeatured(projectToEdit.featured || false);
      } else {
        setTitle('');
        setCategory(categories && categories.length > 0 ? categories[0] : 'وێبسایت');
        setCoverImage('');
        setImages([]);
        setDescription('');
        setDate('٢٠٢٤');
        setStartDate('');
        setEndDate('');
        setLocationName('');
        setCity('سلێمانی');
        setCountry('کوردستان');
        setExternalLink('');
        setVideoLink('');
        setFeatured(false);
      }
      setNewImageUrl('');
      setError(null);
    }
  }, [isOpen, projectToEdit, categories]);

  if (!isOpen) return null;

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setError(null);
      const url = await uploadImage(file);
      setCoverImage(url);
      if (!images.includes(url)) {
        setImages((prev) => [url, ...prev]);
      }
    } catch (err: any) {
      setError('هەڵەیەک ڕوویدا لە بارکردنی وێنەی بەرگ.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingGallery(true);
      setError(null);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadImage(file);
        setImages((prev) => [...prev, url]);
        if (!coverImage) {
          setCoverImage(url);
        }
      }
    } catch (err: any) {
      setError('هەڵەیەک ڕوویدا لە بارکردنی وێنەکانی گەلەری.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    if (!coverImage) {
      setCoverImage(newImageUrl.trim());
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (coverImage === removedUrl) {
      const remaining = images.filter((_, idx) => idx !== indexToRemove);
      setCoverImage(remaining[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !description.trim()) {
      setError('تکایە ناونیشانی پڕۆژە، بەش و ڕوونکردنەوە پڕبکەرەوە.');
      return;
    }

    if (!coverImage && images.length > 0) {
      setCoverImage(images[0]);
    }

    try {
      setSaving(true);
      setError(null);

      const finalCover = coverImage.trim() || (images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop');
      const finalImages = images.length > 0 ? images : [finalCover];

      const projectData: any = {
        title: title.trim(),
        category: category.trim(),
        coverImage: finalCover,
        images: finalImages,
        description: description.trim(),
        date: date.trim() || '٢٠٢٤',
        locationName: locationName.trim() || 'سلێمانی',
        city: city.trim() || 'سلێمانی',
        country: country.trim() || 'کوردستان',
        featured: Boolean(featured),
        createdAt: projectToEdit?.createdAt || Date.now(),
      };

      if (startDate.trim()) projectData.startDate = startDate.trim();
      if (endDate.trim()) projectData.endDate = endDate.trim();
      if (externalLink.trim()) projectData.externalLink = externalLink.trim();
      if (videoLink.trim()) projectData.videoLink = videoLink.trim();

      if (projectToEdit) {
        await updateProject(projectToEdit.id, projectData);
      } else {
        await createProject(projectData);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving project:', err);
      const msg = err?.message ? `هەڵەیەک ڕوویدا لە پاشەکەوتکردندا: ${err.message}` : 'هەڵەیەک لە پاشەکەوتکردنی پڕۆژەکەدا ڕوویدا.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const availableCategories = useMemo(() => {
    const list =
      categories && categories.length > 0
        ? [...categories]
        : ['وێبسایت', 'ئەپڵیکەیشن', 'سیستەم', 'دیزاینی UI/UX', 'براندینگ'];
    if (category && !list.includes(category)) {
      list.push(category);
    }
    return list;
  }, [categories, category]);

  return (
    <AnimatePresence>
      <div
        id="project-form-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-3xl bg-[#0b1120] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {projectToEdit ? 'دەستکاریکردنی پڕۆژە' : 'زیادکردنی پڕۆژەی نوێ'}
            </h2>
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
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  ناونیشانی پڕۆژە <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ناوی پڕۆژەکە بنووسە..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    بەش / پۆلێن (Category) <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryManagerOpen(true)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="دەستکاریکردن و بەڕێوەبردنی پۆلێنەکان"
                  >
                    <FolderKanban className="w-3 h-3" />
                    <span>بەڕێوەبردنی بەشەکان</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="وێبسایت، ئەپڵیکەیشن..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        category === cat
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Image Upload & Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                وێنەی بەرگی سەرەکی (Cover Image)
              </label>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {coverImage ? (
                  <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0">
                    <img
                      src={coverImage}
                      alt="بەرگ"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      بەرگی پڕۆژە
                    </div>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 aspect-video rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <span className="text-[11px]">هیچ بەرگێک نییە</span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    ref={coverInputRef}
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingCover ? 'باردەکرێت...' : 'بارکردنی وێنە لە ئامێرەکەتەوە'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="یان لینکی وێنە لێرە دابنێ (Image URL)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors dir-ltr text-right"
                  />
                </div>
              </div>
            </div>

            {/* Multiple Gallery Images */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  وێنە زیادەکانی گەلەری (Multiple Images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={galleryInputRef}
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{uploadingGallery ? 'باردەکرێت...' : 'بارکردنی کۆمەڵە وێنە'}</span>
                </button>
              </div>

              {/* Gallery Previews Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${idx}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCoverImage(imgUrl)}
                        title="دیاریکردن وەک بەرگ"
                        className={`p-1.5 rounded-lg text-xs ${
                          coverImage === imgUrl ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="سڕینەوە"
                        className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add by URL */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="یان لینکی وێنەی تر (URL) بنووسە..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 dir-ltr text-right"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  زیادکردنی لینک
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                دەقی ڕوونکردنەوەی پڕۆژە <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="دەربارەی پڕۆژەکە، کارکردن و گرنگییەکەی بنووسە..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Dates: Main, Start, End */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  بەرواری پڕۆژە (Date)
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="٢٠٢٤ یان ئایاری ٢٠٢٤"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  بەرواری دەستپێکردن (Start Date)
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="کانوونی دووەم ٢٠٢٤"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  بەرواری تەواوبوون (End Date)
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="ئایاری ٢٠٢٤"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Location: Name, City, Country */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  ناوی شوێن (Location Name)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="نووسینگە یان پلاتفۆرم"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  شار (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="سلێمانی، هەولێر..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  وڵات (Country)
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="کوردستان / عێراق"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* External Links: Website & Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  لینکی دەرەکی (External Link)
                </label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 dir-ltr text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  لینکی ڤیدیۆ (Video Link)
                </label>
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 dir-ltr text-right"
                />
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="featured-toggle"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <label htmlFor="featured-toggle" className="text-xs sm:text-sm text-slate-300 font-medium cursor-pointer">
                ئەم پڕۆژەیە وەک پڕۆژەی تایبەت (Featured Project) نیشانبدرێت
              </label>
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
                className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>پاشەکەوت دەکرێت...</span>
                  </>
                ) : (
                  <span>{projectToEdit ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'زیادکردنی پڕۆژە'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Nested Category Manager Modal */}
        <CategoryManagerModal
          isOpen={categoryManagerOpen}
          onClose={() => setCategoryManagerOpen(false)}
          categories={availableCategories}
          projects={[]}
        />
      </div>
    </AnimatePresence>
  );
};
