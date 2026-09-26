import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Bed, ChevronLeft, ChevronRight, UserCheck, Sparkles, Navigation } from 'lucide-react';

export const ListingCard = ({ listing }) => {
  if (!listing) return null;

  const defaultImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
  const images = listing.images && listing.images.length > 0 ? listing.images : [defaultImage];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(amount).replace('LKR', 'Rs.');
  };

  const getGenderBadge = (gender) => {
    switch (gender) {
      case 'boys_only':
        return { label: 'Boys Only', bg: 'var(--primary-subtle)', text: 'var(--primary)', border: 'var(--primary-border)' };
      case 'girls_only':
        return { label: 'Girls Only', bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' };
      default:
        return { label: 'Any Gender', bg: 'var(--bg-subtle)', text: 'var(--text-secondary)', border: 'var(--border-hairline)' };
    }
  };

  const genderInfo = getGenderBadge(listing.genderPreference);
  const isAvailable = listing.availableBeds > 0;
  const rating = listing.averageRating || 4.8;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '20px',
        border: '1px solid #E6E8EC',
        backgroundColor: '#FFFFFF',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      }}
    >
      {/* Listing Image Carousel & Floating Chips */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          backgroundColor: '#F1F5F9',
        }}
      >
        <img
          src={images[activeImageIndex]}
          alt={listing.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultImage;
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-smooth)',
          }}
        />

        {/* Carousel Navigation Arrows if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                opacity: 0.9,
                transition: 'opacity var(--transition-fast)',
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextImage}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                opacity: 0.9,
                transition: 'opacity var(--transition-fast)',
              }}
              aria-label="Next image"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            {/* Carousel Dot Indicators */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '5px',
                zIndex: 2,
              }}
            >
              {images.map((_, idx) => (
                <span
                  key={idx}
                  style={{
                    width: activeImageIndex === idx ? '16px' : '5px',
                    height: '5px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: activeImageIndex === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                    transition: 'all var(--transition-fast)',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges: Gender Policy & Room Style */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          {/* Gender Preference Floating Pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.725rem',
              fontWeight: 700,
              backgroundColor: genderInfo.bg,
              color: genderInfo.text,
              border: `1px solid ${genderInfo.border}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <UserCheck size={12} strokeWidth={2.5} />
            {genderInfo.label}
          </span>

          {/* Room Style Pill */}
          <span
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.725rem',
              fontWeight: 700,
              backgroundColor: 'rgba(20, 20, 22, 0.8)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              textTransform: 'capitalize',
            }}
          >
            {listing.roomType?.replace('_', ' ')}
          </span>
        </div>

        {/* Bottom Bed Slot Free Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
            zIndex: 2,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isAvailable ? '#FFFFFF' : '#FFF1F2',
              color: isAvailable ? 'var(--text-primary)' : 'var(--status-danger-text)',
              border: `1px solid ${isAvailable ? '#E6E8EC' : 'var(--status-danger-border)'}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            }}
          >
            <span
              className={isAvailable && listing.availableBeds === 1 ? 'pulse-dot' : ''}
              style={{
                backgroundColor: isAvailable ? '#10B981' : '#E11D48',
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
              }}
            />
            <Bed size={13} strokeWidth={2.2} />
            {isAvailable ? `${listing.availableBeds} of ${listing.totalBeds} beds free` : 'Fully Occupied'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Proximity / University Header & Quick Map Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.35rem',
            color: 'var(--primary)',
            fontSize: '0.775rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.4rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <MapPin size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.nearestUniversity} • {listing.distanceToCampus || listing.city}
            </span>
          </div>

          {(listing.googleMapsUrl || (listing.latitude && listing.longitude)) && (
            <a
              href={
                listing.googleMapsUrl ||
                `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Get Directions in Google Maps"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                textTransform: 'none',
                padding: '0.15rem 0.45rem',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.backgroundColor = '#EEF4FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = '#F1F5F9';
              }}
            >
              <Navigation size={10} />
              <span>Map</span>
            </a>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            marginBottom: '0.65rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {listing.title}
        </h3>

        {/* TripGuide Style Pill Ribbon directly under title */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#E8F7EE',
              color: '#059669',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            {rating} Perfect
          </span>
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#EEF4FF',
              color: '#2563EB',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'capitalize',
            }}
          >
            {listing.roomType?.replace('_', ' ')}
          </span>
          <span
            style={{
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF8EC',
              color: '#D97706',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            Top value
          </span>
          {/* Star rating display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={11} fill="#FFAF38" color="#FFAF38" />
            ))}
          </div>
        </div>

        {/* Amenities Preview */}
        {listing.facilities && listing.facilities.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              marginBottom: '1rem',
            }}
          >
            {listing.facilities.slice(0, 3).map((f, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#F4F5F6',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}
              >
                {f}
              </span>
            ))}
            {listing.facilities.length > 3 && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                +{listing.facilities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price & Action Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid #E6E8EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {formatPrice(listing.rentAmount)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / mo
              </span>
            </div>

            {listing.keyMoney > 0 ? (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Key money: {formatPrice(listing.keyMoney)}
              </div>
            ) : (
              <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '1px', fontWeight: 700 }}>
                No Key Money Deposit
              </div>
            )}
          </div>

          <Link
            to={`/listings/${listing._id}`}
            className="btn btn-primary btn-sm"
            style={{
              backgroundColor: '#3B71FE',
              borderRadius: '12px',
              padding: '0.55rem 1.15rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(59, 113, 254, 0.25)',
            }}
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};
