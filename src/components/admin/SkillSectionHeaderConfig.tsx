import React, { useState } from 'react';
import { SKILL_ICON_OPTIONS, getSkillIconComponent } from '../SkillIcon';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SkillSectionHeaderConfigProps {
  title: string;
  onTitleChange: (val: string) => void;
  selectedIconId?: string;
  onIconChange: (id: string) => void;
  defaultTitle: string;
  defaultIcon: string;
  sectionBadge: string;
  themeColor: 'indigo' | 'cyan';
}

export const SkillSectionHeaderConfig: React.FC<SkillSectionHeaderConfigProps> = ({
  title,
  onTitleChange,
  selectedIconId,
  onIconChange,
  defaultTitle,
  defaultIcon,
  sectionBadge,
  themeColor,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const CurrentIcon = getSkillIconComponent(selectedIconId, defaultIcon);

  const isIndigo = themeColor === 'indigo';
  const currentIconObj =
    SKILL_ICON_OPTIONS.find((o) => o.id === (selectedIconId || defaultIcon)) ||
    SKILL_ICON_OPTIONS[0];

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-950/80 border ${
        isIndigo ? 'border-indigo-900/50' : 'border-cyan-900/50'
      } space-y-3 mb-3 shadow-inner`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isIndigo
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
            }`}
          >
            {sectionBadge}
          </span>
          <span className="text-xs text-slate-300 font-medium">
            دەستکاریکردنی ناونیشان و لۆگۆی ئەم بەشە
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={`self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
            isIndigo
              ? 'text-indigo-300 border-indigo-900/60 hover:border-indigo-700'
              : 'text-cyan-300 border-cyan-900/60 hover:border-cyan-700'
          }`}
        >
          <CurrentIcon className="w-4 h-4" />
          <span>لۆگۆ: {currentIconObj.name.split(' ')[0]}</span>
          {showPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Title input with live icon preview */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-slate-400">
          ناونیشانی پیشاندراو (Title):
        </label>
        <div className="flex items-center gap-2">
          <div
            className={`p-2.5 rounded-xl bg-slate-900 border flex items-center justify-center flex-shrink-0 ${
              isIndigo
                ? 'border-indigo-900/60 text-indigo-400'
                : 'border-cyan-900/60 text-cyan-400'
            }`}
            title="لۆگۆی ئێستای بەشەکە"
          >
            <CurrentIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={defaultTitle}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Icon Picker Popdown */}
      {showPicker && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-300">
              لۆگۆ یان ئایکۆنێکی نوێ هەڵبژێرە بۆ ئەم بەشە:
            </span>
            <span className="text-[10px] text-slate-500">
              کلیک لە هەر ئایکۆنێک بکە
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1.5 bg-slate-900/70 rounded-xl border border-slate-800/80">
            {SKILL_ICON_OPTIONS.map((opt) => {
              const Icon = opt.IconComponent;
              const isSelected = (selectedIconId || defaultIcon) === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onIconChange(opt.id);
                    setShowPicker(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-right text-xs transition-all cursor-pointer ${
                    isSelected
                      ? isIndigo
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                        : 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30 ring-1 ring-white/20'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-[11px]">{opt.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
