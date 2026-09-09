import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Share2,
  Mail,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Home,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Phone,
  Layers,
  ArrowRight,
  Scissors,
  Wrench,
  Image as ImageIcon,
  Award,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ContactMessage, Profile, Project, Skill, Experience, SocialLink, AdminUser, Certificate } from '../../types';
import {
  logoutAdmin,
  deleteProject,
  deleteCertificate,
  updateProfile,
  updateSocials,
  uploadImage,
  resetToDefaultData,
  deleteMessage,
  markMessageAsRead,
  compressImage,
  getAdminCredentialsInfo,
  updateAdminCredentials,
} from '../../services/firebase';
import { ProjectFormModal } from './ProjectFormModal';
import { CertificateFormModal } from './CertificateFormModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { ImageCropModal } from './ImageCropModal';
import { SkillSectionHeaderConfig } from './SkillSectionHeaderConfig';
import { getSocialIcon, SOCIAL_PLATFORMS } from '../../utils/socialIcons';

interface AdminDashboardProps {
  user: FirebaseUser | AdminUser;
  profile: Profile;
  projects: Project[];
  certificates?: Certificate[];
  categories?: string[];
  socials: SocialLink[];
  messages: ContactMessage[];
  visitorCount?: number;
  onClose: () => void;
}

type TabType = 'overview' | 'projects' | 'certificates' | 'about' | 'socials' | 'contact' | 'security' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  profile: initialProfile,
  projects,
  certificates = [],
  categories = [],
  socials: initialSocials,
  messages,
  visitorCount,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Categories list
  const categoriesList = useMemo(() => {
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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Local state for profile form
  const [profileForm, setProfileForm] = useState<Profile>(initialProfile);
  const [socialsForm, setSocialsForm] = useState<SocialLink[]>(initialSocials);

  // Project Modal state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Certificate Modal state
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certificate | null>(null);

  // Status banners
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Photo upload & Crop
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Logo upload state
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Admin Security state
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  // Load current admin credentials info
  useEffect(() => {
    getAdminCredentialsInfo().then((info) => {
      const email = info.adminEmail || user.email || initialProfile.email || '';
      setAdminEmail(email);
      setNewAdminEmail(email);
    });
  }, [user, initialProfile]);

  // Synchronize when props update
  useEffect(() => {
    setProfileForm(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setSocialsForm(initialSocials);
  }, [initialSocials]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`ئایا دڵنیایت دەتەوێت پڕۆژەی "${title}" بسڕیتەوە؟`)) {
      try {
        await deleteProject(id);
        setSaveStatus('پڕۆژەکە بە سەرکەوتوویی سڕایەوە.');
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        setSaveError('سڕینەوەی پڕۆژەکە سەرکەوتوو نەبوو.');
      }
    }
  };

  // Delete certificate
  const handleDeleteCert = async (id: string, title: string) => {
    if (window.confirm(`ئایا دڵنیایت دەتەوێت بڕوانامەی "${title}" بسڕیتەوە؟`)) {
      try {
        await deleteCertificate(id);
        setSaveStatus('بڕوانامەکە بە سەرکەوتوویی سڕایەوە.');
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (err) {
        setSaveError('سڕینەوەی بڕوانامەکە سەرکەوتوو نەبوو.');
      }
    }
  };

  // Avatar Upload: read file and immediately open Crop Modal
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaveError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageToCrop(dataUrl);
        setCropModalOpen(true);
      }
    };
    reader.onerror = () => {
      setSaveError('نەتوانرا فایلەکە بخوێندرێتەوە');
    };
    reader.readAsDataURL(file);

    // Reset input so user can pick same file again if desired
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Open cropper with current photo
  const handleOpenCropperForCurrent = () => {
    const currentSrc = profileForm.profilePhoto?.trim();
    if (!currentSrc) {
      avatarInputRef.current?.click();
      return;
    }
    setImageToCrop(currentSrc);
    setCropModalOpen(true);
  };

  // Save Cropped Result
  const handleCroppedSave = async (croppedDataUrl: string) => {
    try {
      setUploadingAvatar(true);
      setSaveError(null);
      const updatedProfile = { ...profileForm, profilePhoto: croppedDataUrl };
      setProfileForm(updatedProfile);

      // Auto-save to Firestore immediately
      await updateProfile(updatedProfile);
      setSaveStatus('وێنەی پرۆفایل بە سەرکەوتوویی بڕدرا و لە ماڵپەڕدا پاشەکەوت کرا!');
      setTimeout(() => setSaveStatus(null), 4500);
    } catch (err: any) {
      console.error('Error saving cropped avatar:', err);
      setSaveError('هەڵەیەک لە پاشەکەوتکردنی وێنەکە ڕوویدا: ' + (err?.message || 'تکایە دووبارە هەوڵبدەرەوە'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Direct Save Profile Photo URL
  const handleSaveAvatarUrlOnly = async () => {
    if (!profileForm.profilePhoto?.trim()) {
      setSaveError('تکایە بەستەری وێنە بنووسە.');
      return;
    }
    try {
      setUploadingAvatar(true);
      setSaveError(null);
      await updateProfile(profileForm);
      setSaveStatus('وێنەی پرۆفایل بە سەرکەوتوویی نوێکرایەوە و پاشەکەوت کرا!');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveError('هەڵەیەک لە پاشەکەوتکردنی وێنەکە ڕوویدا.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setSaveError(null);
      const compressed = await compressImage(file, 400, 400, 0.9);
      setProfileForm((prev) => ({
        ...prev,
        logo: compressed,
      }));
      setSaveStatus('لۆگۆ بە سەرکەوتوویی بارکرا. تکایە پاشەکەوتی بکە تا لە ماڵپەڕ دەربکەوێت.');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveError('هەڵە لە بارکردنی لۆگۆ: ' + (err?.message || 'تکایە دووبارە هەوڵبدەرەوە'));
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setProfileForm((prev) => ({
      ...prev,
      logo: '',
    }));
  };

  // Update Admin Security & Password
  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecurityStatus(null);

    if (!newAdminEmail.trim()) {
      setSecurityError('تکایە ئیمەیڵێکی دروست بنووسە.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setSecurityError('وشەی نهێنی نوێ دەبێت لانیکەم ٦ پیت یان ژمارە بێت.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSecurityError('دووبارەکردنەوەی وشەی نهێنی نوێ لەگەڵ وشەی نهێنی نوێ یەکناگرێتەوە.');
      return;
    }

    try {
      setUpdatingSecurity(true);
      await updateAdminCredentials(
        newAdminEmail.trim(),
        newPassword.trim() || undefined,
        currentPassword.trim() || undefined
      );
      setAdminEmail(newAdminEmail.trim().toLowerCase());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityStatus('زانیارییەکانی چوونەژوورەوەی بەڕێوەبەر بە سەرکەوتوویی و پارێزراوی لە داتابەیس پاشەکەوت کران.');
      setTimeout(() => setSecurityStatus(null), 5000);
    } catch (err: any) {
      setSecurityError(err.message || 'هەڵەیەک ڕوویدا لە نوێکردنەوەی زانیارییەکانی بەڕێوەبەر.');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      // Clean and normalize skills before saving
      const cleanedSkills = (profileForm.skills || []).map((s) => ({
        id: s.id || Date.now().toString(),
        name: s.name || '',
        category: s.category || '',
        hasRating: s.hasRating !== false,
        level: s.hasRating === false ? 0 : typeof s.level === 'number' ? s.level : 80,
      }));

      const cleanProfile: Profile = {
        ...profileForm,
        name: profileForm.name || '',
        logo: profileForm.logo || '',
        yearsOfExperience: profileForm.yearsOfExperience || '٦+ ساڵ',
        yearsOfExperienceLabel: profileForm.yearsOfExperienceLabel || 'ئەزموونی کارکردن',
        completedProjectsCount: profileForm.completedProjectsCount || '٤٥+ پڕۆژە',
        completedProjectsLabel: profileForm.completedProjectsLabel || 'پڕۆژەی تەواوکراو',
        ratedSkillsTitle: profileForm.ratedSkillsTitle || 'شارەزاییە سەرەکییەکان (بە نمرە)',
        ratedSkillsIcon: profileForm.ratedSkillsIcon || 'terminal',
        unratedSkillsTitle: profileForm.unratedSkillsTitle || 'ئامراز و بەهرەکانی تر (بێ نمرە)',
        unratedSkillsIcon: profileForm.unratedSkillsIcon || 'wrench',
        skills: cleanedSkills,
      };

      await updateProfile(cleanProfile);
      setProfileForm(cleanProfile);
      setSaveStatus('زانیارییەکانی پۆرتفۆلیۆ (ناو، لۆگۆ، ئەزموون، شارەزاییەکان) بە سەرکەوتوویی پاشەکەوت کران.');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(
        'هەڵەیەک لە پاشەکەوتکردن ڕوویدا: ' + (err?.message || 'تکایە دووبارە هەوڵبدەرەوە')
      );
    } finally {
      setSaving(false);
    }
  };

  // Save Socials
  const handleSaveSocials = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      await updateSocials(socialsForm);
      setSaveStatus('بەستەرەکانی تۆڕە کۆمەڵایەتییەکان بە سەرکەوتوویی پاشەکەوت کران.');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveError('هەڵەیەک لە پاشەکەوتکردنی تۆڕە کۆمەڵایەتییەکان ڕوویدا.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Social Link
  const handleToggleSocial = (id: string) => {
    setSocialsForm((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Update Social URL
  const handleUpdateSocialUrl = (id: string, url: string) => {
    setSocialsForm((prev) =>
      prev.map((s) => (s.id === id ? { ...s, url } : s))
    );
  };

  // Add Skill (with or without rating)
  const handleAddSkill = (hasRating: boolean = true) => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: hasRating ? 'شارەزایی نوێ' : 'ئامراز / لێهاتوویی نوێ',
      level: hasRating ? 80 : 0,
      category: hasRating ? 'گەشەپێدان' : 'ئامرازەکان',
      hasRating: hasRating,
    };
    setProfileForm((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));
  };

  const handleToggleSkillRating = (id: string) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((s) => {
        if (s.id !== id) return s;
        const currentHasRating = s.hasRating !== false;
        return {
          ...s,
          hasRating: !currentHasRating,
          level: !currentHasRating ? (s.level && s.level > 0 ? s.level : 80) : 0,
        };
      }),
    }));
  };

  const handleRemoveSkill = (id: string) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const handleUpdateSkill = (id: string, field: keyof Skill, value: any) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  // Add Experience
  const handleAddExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: 'پێگەی نوێ',
      company: 'ناوی کۆمپانیا',
      period: '٢٠٢٤ - ئێستا',
      description: 'ڕوونکردنەوە دەربارەی ئەرکەکانت بنووسە...',
      current: false,
    };
    setProfileForm((prev) => ({
      ...prev,
      experiences: [...(prev.experiences || []), newExp],
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setProfileForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: any) => {
    setProfileForm((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));
  };

  // Reset to sample defaults
  const handleResetData = async () => {
    if (
      window.confirm(
        'ئایا دڵنیایت دەتەوێت هەموو داتاکان بگەڕێنیتەوە بۆ نموونە بنەڕەتییە کوردییەکان؟ ئەم کردارە هەموو گۆڕانکارییەکان دەسڕێتەوە.'
      )
    ) {
      try {
        setSaving(true);
        await resetToDefaultData();
        setSaveStatus('داتاکان بە سەرکەوتوویی گەڕێنرانەوە بۆ بنەڕەتی.');
        setTimeout(() => setSaveStatus(null), 4000);
      } catch (err) {
        setSaveError('گەڕاندنەوەی داتاکان سەرکەوتوو نەبوو.');
      } finally {
        setSaving(false);
      }
    }
  };

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  return (
    <div
      id="admin-dashboard-root"
      className="fixed inset-0 z-50 bg-[#070b14] text-slate-100 flex flex-col overflow-hidden"
    >
      {/* Top Navbar */}
      <header className="h-16 bg-[#0b1120] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>داشبۆردی بەڕێوەبردن</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Admin
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Live Public Site */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">ماڵپەڕی زیندوو</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">دەرچوون</span>
          </button>
        </div>
      </header>

      {/* Main Content Area with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#090e1a] border-b md:border-b-0 md:border-l border-slate-800/80 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>پوختە و ئامارەکان</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4" />
              <span>بەڕێوەبردنی پڕۆژەکان</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'certificates'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4" />
              <span>بەڕێوەبردنی بڕوانامەکان</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
              {certificates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'about'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>دەربارەی من (About Me)</span>
          </button>

          <button
            onClick={() => setActiveTab('socials')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'socials'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>تۆڕە کۆمەڵایەتییەکان</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4" />
              <span>پەیوەندی و پەیامەکان</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer mt-auto ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>ڕێکخستنەکان و داتا</span>
          </button>
        </aside>

        {/* Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Notifications */}
          {saveStatus && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-center gap-2.5 shadow-md">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-sm flex items-center gap-2.5 shadow-md">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">کۆی گشتی پڕۆژەکان</span>
                    <FolderKanban className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {projects.length}
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">لە داتابەیسی Firestore</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">بڕوانامەکان</span>
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {certificates.length}
                  </div>
                  <div className="text-xs text-amber-400 mt-1">بڕوانامەی باوەڕپێکراو</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">سەردانیکەران</span>
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {(visitorCount || 1).toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">کۆی گشتی سەردانەکان</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">تۆڕە چالاکەکان</span>
                    <Share2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {initialSocials.filter((s) => s.enabled).length} / {initialSocials.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">بەستەری کۆمەڵایەتی</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">پەیامی سەردانکەران</span>
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {messages.length}
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">
                    {unreadMessagesCount} نەخوێندراوە
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">لێهاتوویی و بەهرەکان</span>
                    <User className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {profileForm.skills?.length || 0}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">شارەزایی تۆمارکراو</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>کردارە خێراکان</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setProjectModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>زیادکردنی پڕۆژەی نوێ</span>
                  </button>

                  <button
                    onClick={() => {
                      setCertToEdit(null);
                      setCertModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>زیادکردنی بڕوانامەی نوێ</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('about')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>دەستکاریکردنی زانیاری کەسی</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('socials')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    <span>ڕێکخستنی لینکەکانی تۆڕ</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer mr-auto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>بینینی ئەنجام لەسەر وێبسایت</span>
                  </button>
                </div>
              </div>

              {/* Recent Projects preview */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">دوایین پڕۆژەکان</h3>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    بینینی هەمووی ({projects.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.slice(0, 3).map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3.5"
                    >
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover bg-slate-950 flex-shrink-0"
                      />
                      <div className="overflow-hidden flex-1">
                        <h4 className="font-bold text-sm text-white truncate">
                          {proj.title}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span>{proj.category}</span>
                          <span>•</span>
                          <span>{proj.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setProjectToEdit(proj);
                          setProjectModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        title="دەستکاریکردن"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">بەڕێوەبردنی پڕۆژەکان</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    زیادکردن، دەستکاریکردن، سڕینەوە و ڕێکخستنی پڕۆژەکان و بەشەکانیان
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                    <span>بەڕێوەبردنی بەشەکان ({categoriesList.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setProjectModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>پڕۆژەی نوێ</span>
                  </button>
                </div>
              </div>

              {/* Categories Overview Banner */}
              <div className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">بەشە چالاکەکان:</span>
                    <span className="text-[11px] text-slate-500">({categoriesList.length} بەش تۆمارکراوە)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesList.map((cat) => {
                      const count = projects.filter((p) => p.category === cat).length;
                      return (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-950 text-indigo-300 font-semibold border border-indigo-900/50">
                            {count}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>دەستکاریکردنی بەشەکان</span>
                </button>
              </div>

              {/* Projects Table / Cards */}
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-2xl bg-[#0b1120] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">
                            {project.title}
                          </h3>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-medium">
                            {project.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            {project.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            {project.city}، {project.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            {project.images?.length || 1} وێنە
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <button
                        onClick={() => {
                          setProjectToEdit(project);
                          setProjectModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                        <span>دەستکاریکردن</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>سڕینەوە</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CERTIFICATES MANAGEMENT */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">بەڕێوەبردنی بڕوانامەکان</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    زیادکردن، دەستکاریکردن، سڕینەوە و ڕێکخستنی بڕوانامە و دەستکەوتەکان
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCertToEdit(null);
                    setCertModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>بڕوانامەی نوێ</span>
                </button>
              </div>

              {/* Certificate List */}
              <div className="grid grid-cols-1 gap-4">
                {certificates.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#0b1120] border border-slate-800">
                    <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">هیچ بڕوانامەیەک تۆمار نەکراوە.</p>
                    <button
                      onClick={() => {
                        setCertToEdit(null);
                        setCertModalOpen(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>یەکەم بڕوانامە زیاد بکە</span>
                    </button>
                  </div>
                ) : (
                  certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-[#0b1120] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {cert.image ? (
                          <img
                            src={cert.image}
                            alt={cert.title}
                            referrerPolicy="no-referrer"
                            className="w-20 h-16 rounded-xl object-cover bg-slate-900 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Award className="w-7 h-7 text-amber-500" />
                          </div>
                        )}
                        <div className="space-y-1 overflow-hidden">
                          <h3 className="font-bold text-base text-white truncate">
                            {cert.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-amber-400 font-medium">
                              <Award className="w-3.5 h-3.5" />
                              {cert.issuer}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                              {cert.issueDate}
                            </span>
                            {cert.credentialId && (
                              <span className="font-mono text-slate-500 text-[11px]">
                                ID: {cert.credentialId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="بەستەری پشتڕاستکردنەوە"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setCertToEdit(cert);
                            setCertModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-400" />
                          <span>دەستکاریکردن</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCert(cert.id, cert.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>سڕینەوە</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT ME MANAGEMENT */}
          {activeTab === 'about' && (
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">دەستکاریکردنی زانیاری دەربارەی من</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    ناوەڕۆکی ئەم بەشە ڕاستەوخۆ لە پەڕەی سەرەکی و دەربارەی من دەردەکەوێت
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {saving ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردنی گۆڕانکارییەکان'}
                </button>
              </div>

              {/* Profile Photo Section */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">وێنەی پرۆفایل</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      وێنەکەت باربکە یان بەستەری ڕاستەوخۆ دابنێ؛ دەستبەجێ لە ماڵپەڕدا نوێ دەبێتەوە.
                    </p>
                  </div>
                  {uploadingAvatar && (
                    <span className="text-xs text-indigo-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                      پاشەکەوت دەکرێت...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-900 shadow-xl flex-shrink-0 group">
                    <img
                      src={profileForm.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'}
                      alt={profileForm.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      ref={avatarInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadingAvatar ? 'پاشەکەوت دەکرێت...' : 'هەڵبژاردنی وێنەی نوێ و کرۆپکردن'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenCropperForCurrent}
                        disabled={uploadingAvatar || !profileForm.profilePhoto}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        title="بڕین و ڕێکخستنی قەبارەی وێنەی ئێستا"
                      >
                        <Scissors className="w-4 h-4 text-indigo-400" />
                        <span>بڕین و ڕێکخستنی ئەم وێنەیە (Crop)</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-400">
                        یان بەستەری ڕاستەوخۆی وێنە (Image URL) لێرە دابنێ:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profileForm.profilePhoto}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, profilePhoto: e.target.value }))
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 dir-ltr text-right focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveAvatarUrlOnly}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>جێگیرکردنی وێنە</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal details: Name, Title, Intro */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white">زانیاری سەرەکی</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">ناوی تەواو</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">پێشە / ناونیشانی کار</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    پێشەکی کورت (لە هێرۆ سکشن نیشاندەدرێت)
                  </label>
                  <textarea
                    rows={2}
                    value={profileForm.heroBio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, heroBio: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    ژیاننامەی تەواو (Biography)
                  </label>
                  <textarea
                    rows={5}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {/* City, Country, Address */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">شار</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">وڵات</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, country: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">دۆخی کار / ئامادەیی</label>
                    <input
                      type="text"
                      value={profileForm.availability}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, availability: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100"
                    />
                  </div>
                </div>

                {/* Stats: Years of Experience and Completed Projects */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      ئامارەکانی ئەزموون و پڕۆژەکان (لە هێرۆ و پێشەکی نیشاندەدرێن)
                    </h4>
                    <span className="text-[11px] text-slate-500">دەتوانیت دەقی ئەزموون و ژمارەکان بگۆڕیت</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        ئەزموونی کارکردن (وەک: ٦+ ساڵ)
                      </label>
                      <input
                        type="text"
                        value={profileForm.yearsOfExperience || ''}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, yearsOfExperience: e.target.value }))
                        }
                        placeholder="نموونە: ٦+ ساڵ یان ٦ ساڵ ئەزموون"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        ئەم دەقە لە کارتی ئاماری پێشەکی لە خوارەوەی بەشی سەرەکی (Hero) دەردەکەوێت.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        پڕۆژەی تەواوکراو (وەک: ٤٥+ پڕۆژە)
                      </label>
                      <input
                        type="text"
                        value={profileForm.completedProjectsCount || ''}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            completedProjectsCount: e.target.value,
                          }))
                        }
                        placeholder="نموونە: ٤٥+ پڕۆژە"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        لە کارتی ئاماری پڕۆژەی تەواوکراودا دەردەکەوێت.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Editor - Part 1: Rated Skills */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>بەشی ١: بەهرە سەرەکییەکان (بە نمرە و ڕێژەی سەدی %)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      بۆ ئەو شارەزاییانەی دەتەوێت ئاستەکەیان بە هێڵی پێشکەوتن و ڕێژەی سەدی دیاری بکەیت (وەک React، UI/UX).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(true)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردنی بەهرە بە نمرە</span>
                  </button>
                </div>

                {/* Customizable title and icon for Rated Skills */}
                <SkillSectionHeaderConfig
                  title={profileForm.ratedSkillsTitle || ''}
                  onTitleChange={(val) =>
                    setProfileForm((prev) => ({ ...prev, ratedSkillsTitle: val }))
                  }
                  selectedIconId={profileForm.ratedSkillsIcon}
                  onIconChange={(id) =>
                    setProfileForm((prev) => ({ ...prev, ratedSkillsIcon: id }))
                  }
                  defaultTitle="شارەزاییە سەرەکییەکان (بە نمرە)"
                  defaultIcon="terminal"
                  sectionBadge="بەشی ١"
                  themeColor="indigo"
                />

                <div className="space-y-3">
                  {(profileForm.skills || []).filter((s) => s.hasRating !== false).length > 0 ? (
                    profileForm.skills
                      ?.filter((s) => s.hasRating !== false)
                      .map((skill) => (
                        <div
                          key={skill.id}
                          className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800"
                        >
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleUpdateSkill(skill.id, 'name', e.target.value)}
                            placeholder="ناوی شارەزایی (وەک: React)"
                            className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={skill.category || ''}
                            onChange={(e) => handleUpdateSkill(skill.id, 'category', e.target.value)}
                            placeholder="بەش (وەک: گەشەپێدان)"
                            className="w-full sm:w-1/4 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          <div className="flex items-center gap-2 w-full sm:flex-1">
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={skill.level || 80}
                              onChange={(e) =>
                                handleUpdateSkill(skill.id, 'level', Number(e.target.value))
                              }
                              className="flex-1 accent-indigo-500"
                            />
                            <span className="text-xs font-mono text-indigo-400 w-10 text-center">
                              {skill.level || 80}%
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSkillRating(skill.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                              title="گۆڕین بۆ بەهرەی بێ نمرە"
                            >
                              بێ نمرە بکە
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 cursor-pointer"
                              title="سڕینەوە"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                      هیچ بەهرەیەکی بە نمرە تۆمار نەکراوە
                    </p>
                  )}
                </div>
              </div>

              {/* Skills Editor - Part 2: Unrated Skills / Tools */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <span>بەشی ٢: بەهرە و ئامرازەکانی تر (بێ نمرە / تەنها ناونیشان)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      بۆ ئەو ئامراز و شارەزاییانەی پێویستیان بە دانانی نمرە نییە (وەک: Git، Docker، Agile، کارامەیی چارەسەرکردنی کێشە).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill(false)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردنی بەهرەی بێ نمرە</span>
                  </button>
                </div>

                {/* Customizable title and icon for Unrated Skills / Tools */}
                <SkillSectionHeaderConfig
                  title={profileForm.unratedSkillsTitle || ''}
                  onTitleChange={(val) =>
                    setProfileForm((prev) => ({ ...prev, unratedSkillsTitle: val }))
                  }
                  selectedIconId={profileForm.unratedSkillsIcon}
                  onIconChange={(id) =>
                    setProfileForm((prev) => ({ ...prev, unratedSkillsIcon: id }))
                  }
                  defaultTitle="ئامراز و بەهرەکانی تر (بێ نمرە)"
                  defaultIcon="wrench"
                  sectionBadge="بەشی ٢"
                  themeColor="cyan"
                />

                <div className="space-y-3">
                  {(profileForm.skills || []).filter((s) => s.hasRating === false).length > 0 ? (
                    profileForm.skills
                      ?.filter((s) => s.hasRating === false)
                      .map((skill) => (
                        <div
                          key={skill.id}
                          className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800"
                        >
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleUpdateSkill(skill.id, 'name', e.target.value)}
                            placeholder="ناوی ئامراز یان بەهرە (وەک: Git & GitHub)"
                            className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={skill.category || ''}
                            onChange={(e) => handleUpdateSkill(skill.id, 'category', e.target.value)}
                            placeholder="بەش (وەک: ئامرازەکان)"
                            className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                          />
                          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleToggleSkillRating(skill.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                              title="گۆڕین بۆ بەهرەی بە نمرە"
                            >
                              نمرەی پێبدە (%)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 cursor-pointer"
                              title="سڕینەوە"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                      هیچ بەهرەیەکی بێ نمرە تۆمار نەکراوە. دەتوانیت بە دوگمەی سەرەوە ئامراز و بەهرەی بێ نمرە لێرە زیاد بکەیت.
                    </p>
                  )}
                </div>
              </div>

              {/* Experience Editor */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">ئەزموونی کارکردن (Experiences)</h3>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>زیادکردنی ئەزموون</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {profileForm.experiences?.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                          placeholder="پێگە / پۆست"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'company', e.target.value)
                          }
                          placeholder="کۆمپانیا"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, 'period', e.target.value)
                          }
                          placeholder="ماوە (وەک: ٢٠٢٢ - ئێستا)"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) =>
                          handleUpdateExperience(exp.id, 'description', e.target.value)
                        }
                        placeholder="ڕوونکردنەوەی کارەکان..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-slate-400">
                          <input
                            type="checkbox"
                            checked={exp.current || false}
                            onChange={(e) =>
                              handleUpdateExperience(exp.id, 'current', e.target.checked)
                            }
                            className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                          />
                          <span>کاری ئێستامە</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>سڕینەوەی ئەم ئەزموونە</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: SOCIAL MEDIA MANAGEMENT */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">تۆڕە کۆمەڵایەتییەکان</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    چالاککردن، ناچالاککردن، و دەستکاریکردنی بەستەری پلاتفۆرمەکان
                  </p>
                </div>

                <button
                  onClick={handleSaveSocials}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  {saving ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردنی تۆڕەکان'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialsForm.map((social) => {
                  const IconComp = getSocialIcon(social.platform);
                  return (
                    <div
                      key={social.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        social.enabled
                          ? 'bg-[#0b1120] border-slate-800'
                          : 'bg-[#0b1120]/40 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-white">{social.title}</span>
                        </div>

                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <span className={social.enabled ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                            {social.enabled ? 'چالاککراوە' : 'ناچالاکە'}
                          </span>
                          <input
                            type="checkbox"
                            checked={social.enabled}
                            onChange={() => handleToggleSocial(social.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
                          />
                        </label>
                      </div>

                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => handleUpdateSocialUrl(social.id, e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 dir-ltr text-right font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT INFORMATION & INBOX */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              {/* Contact Information Editor */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">زانیاری پەیوەندی گشتی</h3>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    پاشەکەوتکردنی زانیاری پەیوەندی
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">ئیمەیڵ</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 dir-ltr text-right"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">تەلەفۆن</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 dir-ltr text-right"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">ناونیشانی تەواو</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Messages Inbox */}
              <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-400" />
                    <span>پەیامە گەیشتووەکان ({messages.length})</span>
                  </h3>
                </div>

                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    تا ئێستا هیچ پەیامێک لەلایەن سەردانکەرانەوە نەنێردراوە.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-colors ${
                          msg.read
                            ? 'bg-slate-900/50 border-slate-800'
                            : 'bg-indigo-950/20 border-indigo-800/60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{msg.name}</span>
                            <span className="text-xs text-indigo-400 font-mono dir-ltr">
                              {msg.email}
                            </span>
                            {msg.phone && (
                              <span className="text-xs text-cyan-400 font-mono dir-ltr">
                                ({msg.phone})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleDateString('ku-IQ') || 'ئەمڕۆ'}
                            </span>
                            <button
                              onClick={() => markMessageAsRead(msg.id, !msg.read)}
                              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                            >
                              {msg.read ? 'نەخوێندراو' : 'خوێندراوە'}
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="p-1 rounded text-rose-400 hover:bg-rose-950/60 cursor-pointer"
                              title="سڕینەوەی پەیام"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-300 mb-1">
                          بابەت: {msg.subject}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & DATABASE RESET */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-3xl bg-[#0b1120] border border-slate-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">ڕێکخستنەکان و داتای بنەڕەتی</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  دەتوانیت پۆرتفۆلیۆکەت بە یەک کلیک بگەڕێنیتەوە بۆ داتای نموونەی کوردی ئەگەر پێویستت پێی بوو.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>گەڕاندنەوە بۆ داتای سەرەتایی (Reset Demo Data)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ئەم بەشە هەموو پڕۆژە و زانیارییەکان ڕێکدەخاتەوە بە پێشینەی جوان و نموونەی کارەکان بە زمانی کوردی سۆرانی.
                </p>
                <button
                  type="button"
                  onClick={handleResetData}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  گەڕاندنەوەی داتای نموونەی کوردی
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Add/Edit Modal */}
      <ProjectFormModal
        key={projectToEdit ? `edit-proj-${projectToEdit.id}` : 'new-project'}
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
        categories={categoriesList}
        onSaved={() => {
          setSaveStatus('پڕۆژەکە بە سەرکەوتوویی پاشەکەوت کرا.');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categoriesList}
        projects={projects}
      />

      {/* Certificate Add/Edit Modal */}
      <CertificateFormModal
        key={certToEdit ? `edit-cert-${certToEdit.id}` : 'new-cert'}
        isOpen={certModalOpen}
        onClose={() => {
          setCertModalOpen(false);
          setCertToEdit(null);
        }}
        certToEdit={certToEdit}
        onSaved={() => {
          setSaveStatus('بڕوانامەکە بە سەرکەوتوویی پاشەکەوت کرا.');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
      />

      {/* Profile Photo Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={imageToCrop}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCroppedSave}
      />
    </div>
  );
};
