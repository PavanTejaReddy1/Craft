import { cn } from '../../utils/cn.js';

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div className={cn('flex flex-col items-center justify-center text-center py-20 px-4', className)}>
    {Icon && (
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    )}
    <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
