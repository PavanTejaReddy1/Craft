import { cn } from '../../utils/cn.js';
import { getInitials } from '../../utils/format.js';

const sizeMap = {
  xs:  'w-6 h-6 text-[10px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

export const Avatar = ({ src, name, size = 'md', className = '', verified = false }) => {
  const sz = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={cn('rounded-full object-cover ring-2 ring-white', sz)}
        />
      ) : (
        <div className={cn(
          'rounded-full flex items-center justify-center font-semibold ring-2 ring-white bg-gray-200 text-gray-600',
          sz
        )}>
          {getInitials(name)}
        </div>
      )}
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center ring-2 ring-white">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        </span>
      )}
    </div>
  );
};
