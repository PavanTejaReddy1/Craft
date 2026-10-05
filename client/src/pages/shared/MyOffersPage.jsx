import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FileText, ExternalLink, Clock } from 'lucide-react';
import { offerApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner, CardSkeleton } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatCurrency, formatDelivery, formatRelativeTime, truncate } from '../../utils/format.js';
import { OFFER_STATUS_LABELS } from '../../constants/index.js';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Not Selected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const MyOffersPage = () => {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery(
    ['my-offers', status],
    () => offerApi.getMy({ status, limit: 20 }).then((r) => r.data),
    { staleTime: 0 }   // always refetch on mount — offers change frequently
  );

  const offers = data?.data || [];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
        <p className="text-gray-500 text-sm mt-0.5">{data?.pagination?.total || 0} total offers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-thin">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              status === tab.value ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : offers.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No offers found"
          description="Browse projects and submit your first offer."
          action={<Link to="/projects" className="btn-primary">Find Projects</Link>}
        />
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const s = OFFER_STATUS_LABELS[offer.status] || OFFER_STATUS_LABELS.pending;
            return (
              <div key={offer._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/projects/${offer.project?._id}`}
                      className="font-semibold text-gray-900 hover:text-brand-600 transition-colors flex items-center gap-1.5"
                    >
                      {offer.project?.title}
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{offer.project?.category}</p>
                  </div>
                  <Badge color={s.color}>{s.label}</Badge>
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{truncate(offer.coverLetter, 200)}</p>

                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Your price</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(offer.proposedPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Delivery</p>
                    <p className="font-medium text-gray-700">{formatDelivery(offer.deliveryDays)}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRelativeTime(offer.createdAt)}
                  </div>
                </div>

                {offer.status === 'accepted' && (
                  <div className="mt-3">
                    <Link to={`/workspace/${offer.project?._id}`} className="btn-primary text-sm w-full text-center block">
                      Open Workspace
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};
