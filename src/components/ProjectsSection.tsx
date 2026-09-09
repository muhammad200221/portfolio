import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Layers,
  ArrowUpLeft,
  Sparkles,
  Inbox,
  Pencil,
  FolderKanban,
} from 'lucide-react';
import { Project, AdminUser } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { CategoryManagerModal } from './admin/CategoryManagerModal';

interface ProjectsSectionProps {
  projects: Project[];
  loading: boolean;
  onSelectProject: (project: Project) => void;
  categories?: string[];
  user?: FirebaseUser | AdminUser | null;
  onOpenAdminLogin?: () => void;
}

// Extracted ProjectCard with neutral skeleton placeholder while loading
const ProjectCard: React.FC<{
  project: Project;
  index: number;
  onSelect: (p: Project) => void;
}> = ({ project, index, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      onClick={() => onSelect(project)}
      className="group bg-white dark:bg-[#0b1120] border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Cover Image Container with Skeleton */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-slate-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-0" />
        )}
        <img
          src={project.coverImage}
          alt={project.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 relative z-10 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            setImageLoaded(true);
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0b1120] via-transparent to-transparent opacity-90 dark:opacity-80 z-20" />

        {/* Category Chip */}
        <div className="absolute top-3 right-3 z-30">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-indigo-700 dark:text-indigo-300 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            {project.category}
          </span>
        </div>

        {/* Images Count Pill if multiple */}
        {project.images && project.images.length > 1 && (
          <div className="absolute bottom-3 left-3 z-30">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>{project.images.length} وێنە</span>
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Meta info: Date & Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{project.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{project.city}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 tracking-tight">
            {project.title}
          </h3>

          {/* Short Description excerpt */}
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Bottom Action bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            <span>بینینی وردەکارییەکان</span>
            <ArrowUpLeft className="w-4 h-4" />
          </span>

          {project.locationName && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
              {project.locationName}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  loading,
  onSelectProject,
  categories = [],
  user,
  onOpenAdminLogin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('هەمووی');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Compute active categories list, ensuring no categories are lost
  const activeCategoriesList = useMemo(() => {
    const list =
      categories && categories.length > 0
        ? [...categories]
        : ['وێبسایت', 'ئەپڵیکەیشن', 'سیستەم', 'دیزاینی UI/UX', 'براندینگ'];

    projects.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });

    return list;
  }, [categories, projects]);

  const displayTabs = useMemo(() => {
    return ['هەمووی', ...activeCategoriesList];
  }, [activeCategoriesList]);

  // If active category was deleted or renamed, fallback to 'هەمووی'
  useEffect(() => {
    if (selectedCategory !== 'هەمووی' && !activeCategoriesList.includes(selectedCategory)) {
      setSelectedCategory('هەمووی');
    }
  }, [activeCategoriesList, selectedCategory]);

  // Filter projects by category and search
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchCategory =
        selectedCategory === 'هەمووی' || project.category === selectedCategory;
      const matchSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <section id="projects" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>کارە بەرهەمهاتووەکان</span>
          </div>
          <h2
            id="projects-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            کارەکانم و پڕۆژەکان
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
            هەڵبژاردەیەک لە نوێترین و بەهێزترین پڕۆژەکانم لە بوارە جیاوازەکاندا
          </p>
        </div>

        {/* Filter Controls: Categories Tabs, Edit Button, and Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10">
          {/* Categories Tabs & Edit Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
            <div
              className="flex items-center gap-1.5"
              id="project-category-filters"
            >
              {displayTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-[#0b1120] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Edit Categories Button */}
            <button
              type="button"
              id="edit-categories-btn"
              onClick={() => {
                if (user) {
                  setCategoryModalOpen(true);
                } else {
                  onOpenAdminLogin?.();
                }
              }}
              title={
                user
                  ? 'دەستکاریکردن و بەڕێوەبردنی پۆلێنەکانی پڕۆژە'
                  : 'چوونەژوورەوەی ئەدمین بۆ دەستکاریکردنی بەشەکان'
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all whitespace-nowrap cursor-pointer shadow-xs flex-shrink-0"
            >
              <Pencil className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>دەستکاریکردنی بەشەکان</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="projects-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان بەدوای پڕۆژە..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 h-96 animate-pulse"
              >
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-900 rounded-2xl mb-4" />
                <div className="w-2/3 h-6 bg-slate-200 dark:bg-slate-900 rounded mb-2" />
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-900 rounded mb-2" />
                <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-900 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div
            id="projects-grid"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onSelect={onSelectProject}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-20 bg-white/70 dark:bg-[#0b1120]/50 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              هیچ پڕۆژەیەک نەدۆزرایەوە
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              لە ئێستادا هیچ کارێک لەم بەشەدا نییە یان وشەی گەڕانەکەت ناگونجێت.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('هەمووی');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition-colors"
            >
              پاککردنەوەی فلتەرەکان
            </button>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={activeCategoriesList}
        projects={projects}
      />
    </section>
  );
};
