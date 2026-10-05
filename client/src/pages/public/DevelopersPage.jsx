import { useState } from 'react';
import { useQuery } from 'react-query';
import { Search } from 'lucide-react';
import { profileApi } from '../../api/index.js';
import { DeveloperCard } from '../../components/cards/DeveloperCard.jsx';
import { CardSkeleton } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { PublicLayout } from '../../components/layout/AppLayout.jsx';
import { POPULAR_SKILLS } from '../../constants/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';

export const DevelopersPage = () => {
  const [filters, setFilters] = useState({ skill: '', availability: '', minRating: '', page: 1 });
  const debouncedSkill = useDebounce(filters.skill, 400);

  const { data, isLoading } = useQuery(
    ['developers', { ...filters, skill: debouncedSkill }],
    () => profileApi.searchDevelopers({ ...filters, skill: debouncedSkill }).then((r) => r.data),
    { keepPreviousData: true }
  );

  return (
    <PublicLayout>
      <div className="container-app py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Find Developers</h1>
          <p className="text-gray-500">Browse {data?.pagination?.total || '...'} skilled technology professionals</p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by skill or technology..."
              value={filters.skill}
              onChange={(e) => setFilters((p) => ({ ...p, skill: e.target.value, page: 1 }))}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.availability}
            onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value, page: 1 }))}
            className="input w-44"
          >
            <option value="">All availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        {/* Popular skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {POPULAR_SKILLS.slice(0, 10).map((skill) => (
            <button
              key={skill}
              onClick={() => setFilters((p) => ({ ...p, skill, page: 1 }))}
              className={`badge cursor-pointer transition-colors ${filters.skill === skill ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {skill}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data?.profiles?.length === 0 ? (
          <EmptyState icon={Search} title="No developers found" description="Try a different skill or clear your filters." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.profiles?.map((profile) => (
              <DeveloperCard key={profile._id} developer={profile} user={profile.user} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};
