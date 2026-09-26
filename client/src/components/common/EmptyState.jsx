import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No Accommodations Found',
  description = 'We couldn’t find any listings matching your search filters. Try widening your budget limit or changing campus proximity.',
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#FFFFFF',
        border: '1px dashed var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        margin: '1.5rem 0',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-subtle)',
          color: 'var(--primary)',
          marginBottom: '1.25rem',
        }}
      >
        <Icon size={30} strokeWidth={1.8} />
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '440px',
          margin: '0 auto 1.5rem',
          fontSize: '0.925rem',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onAction}
          style={{
            fontWeight: 600,
            padding: '0.5rem 1.25rem',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
