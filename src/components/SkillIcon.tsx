import React from 'react';
import {
  Terminal,
  Code,
  Cpu,
  Sparkles,
  Zap,
  Award,
  Flame,
  Layers,
  BarChart3,
  CheckCircle,
  Wrench,
  Box,
  Briefcase,
  Compass,
  Palette,
  Puzzle,
  Feather,
  Star,
  FolderGit2,
  Rocket,
  Shield,
  Laptop,
} from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export const SKILL_ICON_OPTIONS: IconOption[] = [
  { id: 'terminal', name: 'تێرمینال (Terminal)', IconComponent: Terminal },
  { id: 'code', name: 'کۆد (Code)', IconComponent: Code },
  { id: 'cpu', name: 'چیپ / پرۆسێسەر (CPU)', IconComponent: Cpu },
  { id: 'sparkles', name: 'درەوشاوە (Sparkles)', IconComponent: Sparkles },
  { id: 'zap', name: 'بروسکە / خێرایی (Zap)', IconComponent: Zap },
  { id: 'award', name: 'خەڵات / دەستکەوت (Award)', IconComponent: Award },
  { id: 'flame', name: 'ئاگر / تایبەت (Flame)', IconComponent: Flame },
  { id: 'layers', name: 'چینەکان (Layers)', IconComponent: Layers },
  { id: 'barchart', name: 'ئامار و گەشە (BarChart)', IconComponent: BarChart3 },
  { id: 'check', name: 'پەسەندکراو (Check)', IconComponent: CheckCircle },
  { id: 'wrench', name: 'ئامراز (Wrench)', IconComponent: Wrench },
  { id: 'box', name: 'سندوق / پاکێج (Box)', IconComponent: Box },
  { id: 'briefcase', name: 'کار / پرۆفیشناڵ (Briefcase)', IconComponent: Briefcase },
  { id: 'compass', name: 'قیبلەنما / ڕێگە (Compass)', IconComponent: Compass },
  { id: 'palette', name: 'دیزاین / ڕەنگ (Palette)', IconComponent: Palette },
  { id: 'puzzle', name: 'پازڵ / لێهاتوویی (Puzzle)', IconComponent: Puzzle },
  { id: 'feather', name: 'پەڕ / نەرم (Feather)', IconComponent: Feather },
  { id: 'star', name: 'ئەستێرە (Star)', IconComponent: Star },
  { id: 'git', name: 'گیت (Git)', IconComponent: FolderGit2 },
  { id: 'rocket', name: 'موشەک / پرۆژە (Rocket)', IconComponent: Rocket },
  { id: 'shield', name: 'پارێزراو (Shield)', IconComponent: Shield },
  { id: 'laptop', name: 'لاپتۆپ / تەکنەلۆژیا (Laptop)', IconComponent: Laptop },
];

export const getSkillIconComponent = (
  id?: string,
  fallback: string = 'terminal'
): React.ComponentType<{ className?: string }> => {
  const match = SKILL_ICON_OPTIONS.find((opt) => opt.id === id);
  if (match) return match.IconComponent;
  const def = SKILL_ICON_OPTIONS.find((opt) => opt.id === fallback);
  return def ? def.IconComponent : Terminal;
};
