import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Input = forwardRef(({ label, error, hint, className = '', id, required, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn('input', error && 'input-error', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, hint, className = '', id, required, rows = 4, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn('input resize-none', error && 'input-error', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, children, className = '', id, required, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn('input bg-white', error && 'input-error', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
