import { cn } from '../../utils/cn.js';

const colorMap = {
  gray:   'bg-gray-100 text-gray-600',
  dark:   'bg-gray-900 text-white',
  green:  'bg-green-50 text-green-700 border border-green-100',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
  red:    'bg-red-50 text-red-700 border border-red-100',
  blue:   'bg-gray-100 text-gray-700',
  brand:  'bg-gray-100 text-gray-700',
  purple: 'bg-gray-100 text-gray-700',
  orange: 'bg-gray-100 text-gray-700',
};

const dotColorMap = {
  gray:   'bg-gray-400',
  dark:   'bg-white',
  green:  'bg-green-500',
  yellow: 'bg-amber-500',
  red:    'bg-red-500',
  blue:   'bg-gray-500',
  brand:  'bg-gray-500',
  purple: 'bg-gray-500',
  orange: 'bg-gray-500',
};

export const Badge = ({ children, color = 'gray', className = '', dot = false }) => (
  <span className={cn('badge', colorMap[color] || colorMap.gray, className)}>
    {dot && <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotColorMap[color] || dotColorMap.gray)} />}
    {children}
  </span>
);
