export interface Project {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  images: string[];
  description: string;
  date: string;
  startDate?: string;
  endDate?: string;
  locationName: string;
  city: string;
  country: string;
  externalLink?: string;
  videoLink?: string;
  featured?: boolean;
  createdAt: number;
  order?: number;
}

export interface Skill {
  id: string;
  name: string;
  level?: number; // 0 - 100
  category?: string; // e.g., 'گەشەپێدان', 'دیزاین', 'ئامرازەکان'
  hasRating?: boolean; // true = بە نمرە (percentage score), false = بێ نمرە (tag/badge without score)
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  current?: boolean;
}

export interface Profile {
  name: string;
  logo?: string; // Custom logo image URL / data URL
  title: string;
  heroBio: string;
  bio: string;
  profilePhoto: string;
  city: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  availability: string; // e.g. "ئامادەم بۆ وەرگرتنی پڕۆژەی نوێ"
  yearsOfExperience: string;
  yearsOfExperienceLabel?: string; // e.g. "ئەزموونی کارکردن"
  completedProjectsCount: string;
  completedProjectsLabel?: string; // e.g. "پڕۆژەی تەواوکراو"
  ratedSkillsTitle?: string;
  ratedSkillsIcon?: string;
  unratedSkillsTitle?: string;
  unratedSkillsIcon?: string;
  skills: Skill[];
  experiences: Experience[];
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'telegram' | 'whatsapp';
  title: string;
  url: string;
  enabled: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
  skills?: string[];
  description?: string;
  createdAt: number;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

