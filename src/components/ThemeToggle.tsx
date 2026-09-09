import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  id?: string;
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  id = 'theme-toggle-btn',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'گۆڕین بۆ دۆخی ڕووناک (Light mode)' : 'گۆڕین بۆ دۆخی تاریک (Dark mode)'}
      title={isDark ? 'گۆڕین بۆ دۆخی ڕووناک' : 'گۆڕین بۆ دۆخی تاریک'}
      className={`relative inline-flex items-center justify-center rounded-full p-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-400/40 shadow-sm shadow-amber-500/5'
          : 'bg-slate-100 hover:bg-slate-200/90 text-indigo-700 hover:text-indigo-900 border border-slate-300/80 hover:border-indigo-400/50 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-amber-400"
            >
              <Sun className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-indigo-600"
            >
              <Moon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="mr-2 text-xs font-medium select-none">
          {isDark ? 'دۆخی ڕووناک' : 'دۆخی تاریک'}
        </span>
      )}
    </button>
  );
};
