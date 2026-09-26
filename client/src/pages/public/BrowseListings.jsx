import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../../services/listingService';
import { ListingCard } from '../../components/listings/ListingCard';
import { FilterSidebar } from '../../components/listings/FilterSidebar';
import { ListingGridSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, ArrowUpDown, X } from 'lucide-react';

export const BrowseListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search input state (with debouncing)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filters state
  const [filters, setFilters] = useState({
    university: searchParams.get('university') || 'all',
    city: searchParams.get('city') || '',
    maxRent: searchParams.get('maxRent') || '60000',
    roomType: searchParams.get('roomType') || 'all',
    genderPreference: searchParams.get('genderPreference') || 'all',
    facilities: searchParams.get('facilities') ? searchParams.get('facilities').split(',') : [],
    sort: 'newest',
    page: 1,
  });

  const debouncedCity = useDebounce(filters.city, 400);

  // Sync state changes with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.university && filters.university !== 'all') params.set('university', filters.university);
    if (debouncedCity) params.set('city', debouncedCity);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.maxRent && filters.maxRent !== '60000') params.set('maxRent', filters.maxRent);
    if (filters.roomType && filters.roomType !== 'all') params.set('roomType', filters.roomType);
    if (filters.genderPreference && filters.genderPreference !== 'all') params.set('genderPreference', filters.genderPreference);
    if (filters.facilities.length > 0) params.set('facilities', filters.facilities.join(','));
    if (filters.page > 1) params.set('page', filters.page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, debouncedSearch, debouncedCity, setSearchParams]);

  // Query payload
  const queryParams = {
    university: filters.university !== 'all' ? filters.university : undefined,
    city: debouncedCity || undefined,
    maxRent: filters.maxRent,
    roomType: filters.roomType !== 'all' ? filters.roomType : undefined,
    genderPreference: filters.genderPreference !== 'all' ? filters.genderPreference : undefined,
    facilities: filters.facilities.length > 0 ? filters.facilities.join(',') : undefined,
    search: debouncedSearch || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: 9,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', queryParams],
    queryFn: () => listingService.getListings(queryParams),
    keepPreviousData: true,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      university: 'all',
      city: '',
      maxRent: '60000',
      roomType: 'all',
      genderPreference: 'all',
      facilities: [],
      sort: 'newest',
      page: 1,
    });
    setSearchInput('');
  };

  const listings = data?.data?.listings || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalCount: 0 };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Top Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Search input with live debouncing */}
        <div style={{ flex: '1 1 340px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search keywords (e.g., Annex, Wi-Fi, Malabe)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.4rem', paddingRight: '2.2rem' }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
          <select
            className="form-select"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="newest">Newest Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Main Browse Layout (Sidebar + Listings Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 290px) 1fr',
          gap: '2.25rem',
          alignItems: 'start',
        }}
        className="browse-layout"
      >
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Listings Result Column */}
        <div>
          {/* Header Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Boarding Accommodations
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.5rem' }}>
                ({pagination.totalCount} spaces available)
              </span>
            </h2>
          </div>

          {/* Grid or Skeletons */}
          {isLoading ? (
            <ListingGridSkeleton count={6} />
          ) : listings.length > 0 ? (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '1.75rem',
                  opacity: isFetching ? 0.6 : 1,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    marginTop: '3.5rem',
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Accommodations Found"
              description="We couldn't find any student accommodations matching your current filter criteria. Try expanding your budget or changing university campus."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .browse-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
