import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar.jsx';
import { StarRating } from '../ui/StarRating.jsx';
import { AVAILABILITY_LABELS } from '../../constants/index.js';
import { pluralize } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const availDot = { available: 'bg-green-500', busy: 'bg-amber-500', not_available: 'bg-gray-300' };

export const DeveloperCard = ({ developer, user }) => {
  const availability = AVAILABILITY_LABELS[developer.availability] || AVAILABILITY_LABELS.available;
  const userId = user?._id || developer.user?._id || developer.user;

  return (
    <Link to={`/developers/${userId}`} className="card-hover block p-5 group">
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          src={user?.avatar || developer.user?.avatar}
          name={user?.name || developer.user?.name}
          size="md"
          verified={user?.isVerified || developer.user?.isVerified}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-600 transition-colors">
              {user?.name || developer.user?.name}
            </p>
          </div>
          {developer.headline && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{developer.headline}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={developer.averageRating} size="xs" />
            <span className="text-xs text-gray-400">
              {pluralize(developer.completedProjects, 'project')}
            </span>
          </div>
        </div>
        {/* Availability dot */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn('w-1.5 h-1.5 rounded-full', availDot[developer.availability] || availDot.available)} />
          <span className="text-xs text-gray-400">{availability.label}</span>
        </div>
      </div>

      {/* Skills */}
      {developer.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {developer.skills.slice(0, 5).map(s => (
            <span key={s} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded font-medium">{s}</span>
          ))}
          {developer.skills.length > 5 && (
            <span className="px-2 py-0.5 text-xs bg-gray-50 text-gray-400 rounded">+{developer.skills.length - 5}</span>
          )}
        </div>
      )}
    </Link>
  );
};
