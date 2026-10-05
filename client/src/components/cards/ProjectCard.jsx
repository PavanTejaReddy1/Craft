import { Link } from 'react-router-dom';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar.jsx';
import { formatBudget, formatRelativeTime, formatDelivery, truncate } from '../../utils/format.js';
import { PROJECT_STATUS_LABELS } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';

/* Status dot colors — minimal: green dot=open, gray dot=else */
const dotColor = { open: 'bg-green-500', in_progress: 'bg-gray-900', completed: 'bg-gray-400', draft: 'bg-gray-300', cancelled: 'bg-gray-300' };

export const ProjectCard = ({ project, showClient = false }) => {
  const statusInfo = PROJECT_STATUS_LABELS[project.status] || PROJECT_STATUS_LABELS.open;

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card-hover block p-5 group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug line-clamp-2">
            {project.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{project.category}</p>
        </div>
        {/* Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[project.status] || 'bg-gray-300')} />
          <span className="text-xs text-gray-500">{statusInfo.label}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
        {truncate(project.description, 120)}
      </p>

      {/* Tech tags */}
      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.technologies.slice(0, 4).map(t => (
            <span key={t} className="px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded font-medium">{t}</span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-gray-400 bg-gray-50 rounded">+{project.technologies.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-900 text-sm">
            {formatBudget(project.budgetMin, project.budgetMax)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDelivery(project.expectedDeliveryDays)}
          </span>
          {project.offerCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.offerCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showClient && project.client && (
            <Avatar src={project.client.avatar} name={project.client.name} size="xs" />
          )}
          <span className="text-xs text-gray-400">{formatRelativeTime(project.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};
