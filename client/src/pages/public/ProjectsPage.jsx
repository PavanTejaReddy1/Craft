import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { projectApi } from '../../api/index.js';
import { ProjectCard } from '../../components/cards/ProjectCard.jsx';
import { CardSkeleton } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PublicLayout } from '../../components/layout/AppLayout.jsx';
import { PROJECT_CATEGORIES, EXPERIENCE_LEVELS, SORT_OPTIONS } from '../../constants/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';

export const ProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    budgetMin: searchParams.get('budgetMin') || '',
    budgetMax: searchParams.get('budgetMax') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const queryParams = {
    ...filters,
    search: debouncedSearch,
  };

  const { data, isLoading, isFetching } = useQuery(
    ['projects', queryParams],
    () => projectApi.getAll(queryParams).then((r) => r.data),
    { keepPreviousData: true }
  );

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', budgetMin: '', budgetMax: '', experienceLevel: '', sort: 'newest', page: 1 });
  };

  const activeFiltersCount = [filters.category, filters.budgetMin, filters.budgetMax, filters.experienceLevel]
    .filter(Boolean).length;

  return (
    <PublicLayout>
      <div className="container-app py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Explore Projects</h1>
          <p className="text-gray-500">Browse {data?.pagination?.total || '...'} open technology projects</p>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by title, skill, technology..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="input w-44"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary gap-2 relative ${showFilters ? 'bg-gray-100' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="card p-5 mb-6 animate-fade-in">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Category</label>
                <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className="input">
                  <option value="">All categories</option>
                  {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Experience level</label>
                <select value={filters.experienceLevel} onChange={(e) => setFilter('experienceLevel', e.target.value)} className="input">
                  <option value="">Any level</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Min budget (₹)</label>
                <input type="number" placeholder="0" value={filters.budgetMin}
                  onChange={(e) => setFilter('budgetMin', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Max budget (₹)</label>
                <input type="number" placeholder="No limit" value={filters.budgetMax}
                  onChange={(e) => setFilter('budgetMax', e.target.value)} className="input" />
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-sm text-red-600 hover:underline flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.category && (
              <Badge color="brand" className="gap-1">
                {filters.category}
                <button onClick={() => setFilter('category', '')}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {filters.experienceLevel && (
              <Badge color="brand" className="gap-1">
                {EXPERIENCE_LEVELS.find((l) => l.value === filters.experienceLevel)?.label}
                <button onClick={() => setFilter('experienceLevel', '')}><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects found"
            description="Try adjusting your filters or search terms."
            action={<button onClick={clearFilters} className="btn-secondary">Clear filters</button>}
          />
        ) : (
          <>
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-4 ${isFetching ? 'opacity-70' : ''}`}>
              {data?.data?.map((project) => (
                <ProjectCard key={project._id} project={project} showClient />
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination?.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setFilter('page', filters.page - 1)}
                  disabled={!data.pagination.hasPrev}
                  className="btn-secondary disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>
                <button
                  onClick={() => setFilter('page', filters.page + 1)}
                  disabled={!data.pagination.hasNext}
                  className="btn-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
};
