import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { cn } from '../../utils/cn.js';

/**
 * ThemeToggle — a minimal pill toggle that switches between light and dark mode.
 * Can be used in Navbar, Settings, or anywhere else.
 */
export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        // pill shape
        'relative flex items-center w-[52px] h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400',
        isDark
          ? 'bg-gray-700 focus-visible:ring-offset-gray-900'
          : 'bg-gray-200 focus-visible:ring-offset-white',
        className
      )}
    >
      {/* Track icons */}
      <Sun  className={cn('absolute left-1.5  w-3.5 h-3.5 transition-opacity duration-200', isDark ? 'opacity-30 text-gray-400' : 'opacity-80 text-amber-500')} />
      <Moon className={cn('absolute right-1.5 w-3.5 h-3.5 transition-opacity duration-200', isDark ? 'opacity-80 text-white'    : 'opacity-30 text-gray-400')} />

      {/* Thumb */}
      <span
        className={cn(
          'absolute top-[3px] w-[22px] h-[22px] rounded-full shadow-sm transition-all duration-300',
          isDark
            ? 'translate-x-[26px] bg-white'
            : 'translate-x-[3px]  bg-white'
        )}
      />
    </button>
  );
};

/**
 * ThemeToggleIcon — icon-only variant for compact spaces (e.g. Navbar).
 */
export const ThemeToggleIcon = ({ className = '' }) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'p-2 rounded-lg transition-colors',
        isDark
          ? 'text-gray-400 hover:text-white hover:bg-white/[0.08]'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
        className
      )}
    >
      {isDark
        ? <Sun  className="w-[18px] h-[18px]" />
        : <Moon className="w-[18px] h-[18px]" />
      }
    </button>
  );
};
