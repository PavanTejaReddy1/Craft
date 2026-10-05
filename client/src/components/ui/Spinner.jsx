import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' };
  return <Loader2 className={cn('animate-spin text-gray-400', sizeMap[size], className)} />;
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  </div>
);

export const SkeletonLine = ({ className = '' }) => (
  <div className={cn('skeleton h-4 rounded', className)} />
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2 flex-1">
        <SkeletonLine className="w-3/4 h-4" />
        <SkeletonLine className="w-1/2 h-3" />
      </div>
      <SkeletonLine className="w-14 h-5" />
    </div>
    <SkeletonLine className="w-full h-3" />
    <SkeletonLine className="w-4/5 h-3" />
    <div className="flex gap-2 pt-1">
      <SkeletonLine className="w-12 h-5" />
      <SkeletonLine className="w-12 h-5" />
      <SkeletonLine className="w-12 h-5" />
    </div>
  </div>
);
