import { cn } from '../../utils/cn.js';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  brand:     'btn-primary',   // alias → same as primary in minimal theme
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-base',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  as: Component = 'button',
  ...props
}) => (
  <Component
    className={cn(variants[variant] || variants.primary, sizes[size], className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </Component>
);
