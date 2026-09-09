import React from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  MessageCircle,
  Video,
  Globe,
  LucideIcon,
} from 'lucide-react';

export function getSocialIcon(platform: string): LucideIcon {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return Facebook;
    case 'instagram':
      return Instagram;
    case 'linkedin':
      return Linkedin;
    case 'twitter':
    case 'x':
      return Twitter;
    case 'youtube':
      return Youtube;
    case 'telegram':
      return Send;
    case 'whatsapp':
      return MessageCircle;
    case 'tiktok':
      return Video;
    default:
      return Globe;
  }
}

export const SOCIAL_PLATFORMS = [
  { key: 'facebook', name: 'فەیسبووک', placeholder: 'https://facebook.com/username' },
  { key: 'instagram', name: 'ئینستاگرام', placeholder: 'https://instagram.com/username' },
  { key: 'linkedin', name: 'لینکدین', placeholder: 'https://linkedin.com/in/username' },
  { key: 'tiktok', name: 'تیکتۆک', placeholder: 'https://tiktok.com/@username' },
  { key: 'youtube', name: 'یوتیوب', placeholder: 'https://youtube.com/@channel' },
  { key: 'twitter', name: 'ئێکس / تویتەر', placeholder: 'https://x.com/username' },
  { key: 'telegram', name: 'تێلیگرام', placeholder: 'https://t.me/username' },
  { key: 'whatsapp', name: 'واتسئەپ', placeholder: 'https://wa.me/9647700000000' },
];
