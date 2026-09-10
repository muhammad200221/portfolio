import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  Video,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Tag,
  Compass,
} from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [project?.id]);

  if (!project) return null;

  const allImages = [
    project.coverImage,
    ...(project.images || []).filter((img) => img !== project.coverImage),
  ].filter(Boolean);

  // Helper for Google Maps search link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${project.locationName || ''} ${project.city || ''} ${project.country || ''}`
  )}`;

  // Parse video url to see if embeddable
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(project.videoLink);

  return (
    <AnimatePresence>
      <div
        id="project-details-modal"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      >
        {/* Backdrop click to close */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {project.category}
              </span>
              {project.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  پڕۆژەی تایبەت
                </span>
              )}
            </div>

            <button
              id="project-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="داخستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
            {/* Title & Dates */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.title}
              </h2>

              {/* Date & Location Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {/* Dates */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>بەروار:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{project.date}</span>
                  {(project.startDate || project.endDate) && (
                    <span className="text-slate-500 dark:text-slate-400">
                      ({project.startDate || 'سەرەتا'} تا {project.endDate || 'ئێستا'})
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>شوێن:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {project.locationName ? `${project.locationName} - ` : ''}
                    {project.city}، {project.country}
                  </span>
                </div>

                {/* Google Maps link */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 px-3 py-1.5 rounded-xl transition-colors"
                  title="بینینی شوێن لەسەر گووگڵ ماپس"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>لەسەر نەخشەی گووگڵ</span>
                </a>
              </div>
            </div>

            {/* Images Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={allImages[activeImageIndex] || project.coverImage}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
                      aria-label="وێنەی پێشوو"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
                      aria-label="وێنەی دواتر"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails strip */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-indigo-600 dark:border-indigo-500 scale-105'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`تەماشای وێنە ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">دەربارەی پڕۆژەکە</h3>
              <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                {project.description}
              </p>
            </div>

            {/* Video Preview if available */}
            {embedUrl && (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>تەماشاکردنی ڤیدیۆی پڕۆژە</span>
                </h3>
                <div className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <iframe
                    src={embedUrl}
                    title={project.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons: External Link & Video */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {project.externalLink && (
                <a
                  href={project.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>سەردانی ماڵپەڕ / لینکی دەرەکی</span>
                </a>
              )}

              {project.videoLink && !embedUrl && (
                <a
                  href={project.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-medium text-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>بینینی ڤیدیۆی پڕۆژەکە</span>
                </a>
              )}

              <button
                onClick={onClose}
                className="mr-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                داخستن
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
