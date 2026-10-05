import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const sizeMap = {
  sm:   'max-w-md',
  md:   'max-w-xl',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-6xl',
};

export const Modal = ({ open, onClose, title, children, size = 'md', className = '' }) => {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={cn(
        'relative bg-white rounded-2xl shadow-modal w-full overflow-hidden animate-slide-up',
        sizeMap[size], className
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
