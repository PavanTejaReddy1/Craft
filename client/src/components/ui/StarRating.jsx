import { Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const StarRating = ({ rating = 0, max = 5, size = 'sm', showValue = false, interactive = false, onChange }) => {
  const sizeMap = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const sz = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sz, 'transition-colors',
            i < Math.round(rating)
              ? 'fill-gray-800 text-gray-800'
              : 'fill-gray-200 text-gray-200',
            interactive && 'cursor-pointer hover:fill-gray-700 hover:text-gray-700'
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-gray-700">
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
};

export const InteractiveStarRating = ({ value = 0, onChange, label }) => (
  <div className="space-y-2">
    {label && <p className="label">{label}</p>}
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} className="focus:outline-none">
          <Star className={cn(
            'w-8 h-8 transition-colors',
            star <= value ? 'fill-gray-900 text-gray-900' : 'fill-gray-200 text-gray-200'
          )} />
        </button>
      ))}
    </div>
  </div>
);
