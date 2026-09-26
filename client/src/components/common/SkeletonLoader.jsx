import React from 'react';

export const ListingSkeleton = () => {
  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--border-hairline)',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Image Skeleton */}
      <div
        className="shimmer"
        style={{
          width: '100%',
          aspectRatio: '16 / 10',
        }}
      />
      {/* Body Skeleton */}
      <div style={{ padding: '1.25rem' }}>
        <div
          className="shimmer"
          style={{
            height: '14px',
            width: '45%',
            borderRadius: 'var(--radius-xs)',
            marginBottom: '0.65rem',
          }}
        />
        <div
          className="shimmer"
          style={{
            height: '20px',
            width: '85%',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.85rem',
          }}
        />
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          <div className="shimmer" style={{ height: '22px', width: '65px', borderRadius: 'var(--radius-full)' }} />
          <div className="shimmer" style={{ height: '22px', width: '85px', borderRadius: 'var(--radius-full)' }} />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-hairline)',
          }}
        >
          <div className="shimmer" style={{ height: '24px', width: '90px', borderRadius: 'var(--radius-sm)' }} />
          <div className="shimmer" style={{ height: '32px', width: '80px', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
};

export const ListingGridSkeleton = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '1.75rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeleton key={i} />
      ))}
    </div>
  );
};
