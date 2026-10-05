import { Clock, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar.jsx';
import { Badge } from '../ui/Badge.jsx';
import { StarRating } from '../ui/StarRating.jsx';
import { Button } from '../ui/Button.jsx';
import { formatCurrency, formatDelivery, formatRelativeTime, truncate, pluralize } from '../../utils/format.js';
import { OFFER_STATUS_LABELS } from '../../constants/index.js';

export const OfferCard = ({ offer, onAccept, onReject, onShortlist, onViewProfile, isClient = false, loading = false }) => {
  const developer = offer.developer;
  const devProfile = offer.developerProfile;
  const statusInfo = OFFER_STATUS_LABELS[offer.status] || OFFER_STATUS_LABELS.pending;

  return (
    <div className="card p-5">
      {/* Top row */}
      <div className="flex items-start gap-4">
        <Avatar src={developer?.avatar} name={developer?.name} size="md" verified={developer?.isVerified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 text-sm">{developer?.name}</p>
                {developer?.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              {devProfile?.headline && (
                <p className="text-xs text-gray-500 mt-0.5">{devProfile.headline}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(offer.proposedPrice)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDelivery(offer.deliveryDays)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={devProfile?.averageRating || 0} showValue size="xs" />
            <span className="text-xs text-gray-400">{pluralize(devProfile?.completedProjects || 0, 'project')}</span>
            <Badge color={
              offer.status === 'accepted' ? 'green' :
              offer.status === 'pending'  ? 'yellow' : 'gray'
            }>{statusInfo.label}</Badge>
          </div>
        </div>
      </div>

      {/* Skills */}
      {devProfile?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {devProfile.skills.slice(0, 6).map(s => (
            <span key={s} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded font-medium">{s}</span>
          ))}
        </div>
      )}

      {/* Proposal */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-700 leading-relaxed">{truncate(offer.coverLetter, 300)}</p>
      </div>

      {/* Milestones */}
      {offer.milestones?.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Milestones</p>
          {offer.milestones.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{m.title}</span>
              <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(m.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isClient && offer.status === 'pending' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button variant="primary" size="sm" loading={loading} onClick={() => onAccept?.(offer._id)}>
            Accept Offer
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onViewProfile?.(developer?._id)}>
            View Profile
          </Button>
          <button
            onClick={() => onShortlist?.(offer._id)}
            className="ml-auto p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={offer.isShortlisted ? 'Remove from shortlist' : 'Shortlist'}
          >
            {offer.isShortlisted
              ? <BookmarkCheck className="w-4 h-4 text-gray-700" />
              : <Bookmark className="w-4 h-4" />}
          </button>
          <Button variant="ghost" size="sm" onClick={() => onReject?.(offer._id)} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
            Decline
          </Button>
        </div>
      )}
    </div>
  );
};
