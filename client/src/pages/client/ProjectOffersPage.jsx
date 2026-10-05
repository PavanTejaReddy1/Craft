import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { offerApi, projectApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { OfferCard } from '../../components/cards/OfferCard.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { FileText, Users } from 'lucide-react';

export const ProjectOffersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState('newest');
  const [confirmAccept, setConfirmAccept] = useState(null);

  const { data: projectData } = useQuery(['project', id], () => projectApi.getById(id).then((r) => r.data));
  const { data: offersData, isLoading } = useQuery(
    ['project-offers', id, sort],
    () => offerApi.getProjectOffers(id, { sort }).then((r) => r.data),
    { staleTime: 0 }   // always fresh — client needs up-to-date offers
  );

  const acceptMutation = useMutation(
    (offerId) => offerApi.accept(offerId),
    {
      onSuccess: (data) => {
        toast.success('Offer accepted! Project is now active.');
        queryClient.invalidateQueries(['project-offers', id]);
        queryClient.invalidateQueries(['project', id]);
        const contractProjectId = data.data?.contract?.project || id;
        navigate(`/workspace/${contractProjectId}`);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to accept offer'),
    }
  );

  const shortlistMutation = useMutation(
    (offerId) => offerApi.shortlist(offerId),
    { onSuccess: () => queryClient.invalidateQueries(['project-offers', id]) }
  );

  const rejectMutation = useMutation(
    (offerId) => offerApi.reject(offerId),
    {
      onSuccess: () => {
        toast.success('Offer declined');
        queryClient.invalidateQueries(['project-offers', id]);
      },
    }
  );

  const project = projectData?.project;
  const offers = offersData?.data || [];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to project
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
              {project && <p className="text-gray-500 text-sm mt-0.5">{project.title}</p>}
            </div>
            <div className="flex items-center gap-2">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-40 text-sm">
                <option value="newest">Newest first</option>
                <option value="price_low">Lowest price</option>
                <option value="price_high">Highest price</option>
                <option value="delivery">Fastest delivery</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{offers.length} offer{offers.length !== 1 ? 's' : ''} received</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No offers yet"
            description="Developers haven't submitted offers for this project yet. Share it to attract more visibility."
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                isClient
                loading={acceptMutation.isLoading}
                onAccept={(id) => setConfirmAccept(id)}
                onReject={(id) => rejectMutation.mutate(id)}
                onShortlist={(id) => shortlistMutation.mutate(id)}
                onViewProfile={(devId) => navigate(`/developers/${devId}`)}
              />
            ))}
          </div>
        )}

        {/* Confirm accept modal */}
        <Modal open={!!confirmAccept} onClose={() => setConfirmAccept(null)} title="Accept this offer?" size="sm">
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Accepting this offer will make the project active and close all other pending offers. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                loading={acceptMutation.isLoading}
                onClick={() => {
                  acceptMutation.mutate(confirmAccept);
                  setConfirmAccept(null);
                }}
              >
                Accept & Start Project
              </Button>
              <Button variant="secondary" onClick={() => setConfirmAccept(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
};
