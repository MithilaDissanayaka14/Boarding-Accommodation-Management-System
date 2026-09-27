import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../../services/listingService';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import {
  MapPin,
  Bed,
  Check,
  Star,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Home,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Share2,
  Heart,
  Navigation,
  Compass,
  ExternalLink,
  Copy,
  CheckCheck,
  X,
  Images,
  ZoomIn,
} from 'lucide-react';

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80';
const SECONDARY_IMAGE_1 =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80';
const SECONDARY_IMAGE_2 =
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80';

export const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();
  const queryClient = useQueryClient();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLocationLink, setCopiedLocationLink] = useState(false);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index = 0) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleCopyMapLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLocationLink(true);
    setTimeout(() => setCopiedLocationLink(false), 2500);
  };

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch listing data
  const { data: listingData, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingById(id),
  });

  // Fetch reviews for listing
  const { data: reviewsData } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: () => reviewService.getListingReviews(id),
  });

  // Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: (payload) => bookingService.createBooking(payload),
    onSuccess: () => {
      setBookingSuccess(true);
      setBookingError('');
      queryClient.invalidateQueries(['listing', id]);
    },
    onError: (err) => {
      setBookingError(err.response?.data?.message || 'Failed to submit booking request');
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (payload) => reviewService.createReview(payload),
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewError('');
      setReviewComment('');
      queryClient.invalidateQueries(['listing', id]);
      queryClient.invalidateQueries(['listing-reviews', id]);
    },
    onError: (err) => {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    },
  });

  // Safe reference to listing & allPhotos before any conditional early returns
  const listing = listingData?.data?.listing;
  const hasRealImages = Boolean(listing?.images && listing.images.length > 0);
  const allPhotos = hasRealImages
    ? listing.images
    : [DEFAULT_IMAGE, SECONDARY_IMAGE_1, SECONDARY_IMAGE_2];

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
  };

  // Keyboard navigation & body scroll lock for lightbox (always called at top level)
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen, allPhotos.length]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 600 }}>
          Loading accommodation details...
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Accommodation Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The requested boarding space could not be found or has been removed.
        </p>
        <Link to="/listings" className="btn btn-primary">
          Back to Listings
        </Link>
      </div>
    );
  }

  const reviews = reviewsData?.data?.reviews || [];

  // Location Coordinates & Navigation URLs
  const hasCoordinates = listing.latitude != null && listing.longitude != null;
  const lat = hasCoordinates ? Number(listing.latitude) : 6.9148;
  const lng = hasCoordinates ? Number(listing.longitude) : 79.9733;
  const googleDirectionsUrl =
    listing.googleMapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const walkingDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  const drivingDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!moveInDate) {
      setBookingError('Please select your preferred move-in date');
      return;
    }
    bookingMutation.mutate({
      listingId: listing._id,
      moveInDate,
      message: bookingMessage,
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write your review feedback');
      return;
    }
    reviewMutation.mutate({
      listingId: listing._id,
      rating: reviewRating,
      cleanliness: cleanlinessRating,
      landlordCommunication: commRating,
      safety: safetyRating,
      comment: reviewComment,
    });
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* 
        ========================================================================
        BREADCRUMBS & TRIPGUIDE TOP HEADER
        ========================================================================
      */}
      {/* Breadcrumb Trail: Home > Hotel list > Hotel details */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
        }}
        aria-label="Breadcrumb"
      >
        <Link to="/" style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}>
          Home
        </Link>
        <ChevronRight size={13} strokeWidth={2} />
        <Link to="/listings" style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}>
          Accommodations
        </Link>
        <ChevronRight size={13} strokeWidth={2} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {listing.city || 'Malabe'} Details
        </span>
      </nav>

      {/* Main Title & Rating/Location line (TripGuide style) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '0.65rem',
            lineHeight: 1.2,
          }}
        >
          {listing.city} Accommodations and Places to Stay
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          {/* Rating Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Star size={16} fill="#FFAF38" color="#FFAF38" />
            <span>{listing.averageRating || '4.8'}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              ({listing.totalReviews || reviews.length || 12} reviews)
            </span>
          </div>

          <span style={{ color: '#E6E8EC' }}>•</span>

          {/* Location Pin & Quick Directions Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{listing.address}, {listing.city}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700, marginLeft: '0.25rem' }}>
                ({listing.nearestUniversity} • {listing.distanceToCampus})
              </span>
            </div>
            <a
              href="#location-map"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--primary)',
                backgroundColor: '#EEF4FF',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Navigation size={12} />
              <span>Map & Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        PHOTO MOSAIC GALLERY (Interactive TripGuide style with click-to-expand)
        ========================================================================
      */}
      <div style={{ marginBottom: '1.75rem', position: 'relative' }}>
        {allPhotos.length === 1 ? (
          /* Single Image Hero View */
          <div
            className="trip-guide-gallery single-photo-layout"
            style={{
              position: 'relative',
              height: '460px',
              borderRadius: '24px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: '#F1F5F9',
            }}
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
          >
            <img
              src={allPhotos[0]}
              alt={listing.title}
              className="gallery-zoom-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Click to expand hover overlay hint */}
            <div className="gallery-hover-overlay">
              <ZoomIn size={24} />
              <span>Click to view photo</span>
            </div>

            {/* Bed Slot Free Floating Badge */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                color: listing.availableBeds > 0 ? 'var(--primary)' : 'var(--status-danger-text)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                zIndex: 2,
              }}
            >
              <Bed size={15} strokeWidth={2.5} />
              {listing.availableBeds > 0
                ? `${listing.availableBeds} of ${listing.totalBeds} Bed Slots Free`
                : 'Occupied'}
            </div>
          </div>
        ) : allPhotos.length === 2 ? (
          /* Two Images Side-by-Side View */
          <div
            className="trip-guide-gallery two-photos-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
              gap: '1rem',
              height: '460px',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Primary Image */}
            <div
              style={{
                position: 'relative',
                height: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#F1F5F9',
                cursor: 'pointer',
              }}
              onClick={() => openLightbox(0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
            >
              <img
                src={allPhotos[0]}
                alt={listing.title}
                className="gallery-zoom-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="gallery-hover-overlay">
                <ZoomIn size={22} />
                <span>View photo</span>
              </div>
              {/* Bed Slot Free Floating Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  color: listing.availableBeds > 0 ? 'var(--primary)' : 'var(--status-danger-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  zIndex: 2,
                }}
              >
                <Bed size={15} strokeWidth={2.5} />
                {listing.availableBeds > 0
                  ? `${listing.availableBeds} of ${listing.totalBeds} Bed Slots Free`
                  : 'Occupied'}
              </div>
            </div>

            {/* Secondary Image */}
            <div
              style={{
                position: 'relative',
                height: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#F1F5F9',
                cursor: 'pointer',
              }}
              onClick={() => openLightbox(1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(1)}
            >
              <img
                src={allPhotos[1]}
                alt={`${listing.title} 2`}
                className="gallery-zoom-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="gallery-hover-overlay">
                <ZoomIn size={22} />
                <span>View photo</span>
              </div>
            </div>
          </div>
        ) : (
          /* 3+ Images TripGuide Mosaic */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1fr)',
              gap: '1rem',
              height: '460px',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
            }}
            className="trip-guide-gallery"
          >
            {/* Main Large Hero Image */}
            <div
              style={{
                position: 'relative',
                height: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: '#F1F5F9',
                cursor: 'pointer',
              }}
              onClick={() => openLightbox(0)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
            >
              <img
                src={allPhotos[0]}
                alt={listing.title}
                className="gallery-zoom-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="gallery-hover-overlay">
                <ZoomIn size={24} />
                <span>View photo</span>
              </div>
              {/* Bed Slot Free Floating Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  color: listing.availableBeds > 0 ? 'var(--primary)' : 'var(--status-danger-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  zIndex: 2,
                }}
              >
                <Bed size={15} strokeWidth={2.5} />
                {listing.availableBeds > 0
                  ? `${listing.availableBeds} of ${listing.totalBeds} Bed Slots Free`
                  : 'Occupied'}
              </div>
            </div>

            {/* Right Stacked Secondary Photos */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: '1fr 1fr',
                gap: '1rem',
                height: '100%',
              }}
              className="secondary-photos-column"
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#F1F5F9',
                  cursor: 'pointer',
                }}
                onClick={() => openLightbox(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(1)}
              >
                <img
                  src={allPhotos[1]}
                  alt={`${listing.title} interior`}
                  className="gallery-zoom-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="gallery-hover-overlay">
                  <ZoomIn size={20} />
                  <span>View photo</span>
                </div>
              </div>

              <div
                style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#F1F5F9',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => openLightbox(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(2)}
              >
                <img
                  src={allPhotos[2]}
                  alt={`${listing.title} room`}
                  className="gallery-zoom-img"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {allPhotos.length > 3 ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      backdropFilter: 'blur(2px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      gap: '0.4rem',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <Images size={24} />
                    <span>+{allPhotos.length - 2} more photos</span>
                  </div>
                ) : (
                  <div className="gallery-hover-overlay">
                    <ZoomIn size={20} />
                    <span>View photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating "View all photos" button */}
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="btn-view-all-photos"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.05rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.14)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            zIndex: 4,
            transition: 'all 0.2s ease',
          }}
        >
          <Images size={16} strokeWidth={2.2} />
          <span>View all {allPhotos.length} photos</span>
        </button>
      </div>

      {/* 
        ========================================================================
        TRIPGUIDE BADGE RIBBON DIRECTLY BELOW THE PHOTO MOSAIC
        (5.0 Perfect | Hotels | Building | Top value | 5 Gold Stars)
        ========================================================================
      */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.65rem',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #E6E8EC',
        }}
      >
        {/* 5.0 Perfect badge */}
        <span
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#E8F7EE',
            color: '#059669',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {listing.averageRating || '5.0'} Perfect
        </span>

        {/* Room Type badge */}
        <span
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#EEF4FF',
            color: '#2563EB',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        >
          {listing.roomType?.replace('_', ' ') || 'Annex'}
        </span>

        {/* Policy badge */}
        <span
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#F5F3FF',
            color: '#7C3AED',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        >
          {listing.genderPreference?.replace('_', ' ') || 'Any Gender'}
        </span>

        {/* Top value badge */}
        <span
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#FEF8EC',
            color: '#D97706',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          Top value
        </span>

        {/* 5 Gold Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '0.5rem' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={15} fill="#FFAF38" color="#FFAF38" />
          ))}
        </div>
      </div>

      {/* 
        ========================================================================
        TWO-COLUMN MAIN DETAILS & BOOKING CONSOLE LAYOUT
        ========================================================================
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(320px, 390px)',
          gap: '2.5rem',
          alignItems: 'start',
        }}
        className="details-layout"
      >
        {/* Left Column: Exclusive Room Title, Host Info, Specs, Amenities, Rules, Reviews */}
        <div>
          {/* Card Title (e.g. Exclusive room in house / listing.title) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                marginBottom: '0.5rem',
              }}
            >
              {listing.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Hosted by <strong>{listing.ownerId?.name || 'Verified Property Warden'}</strong> • Verified Campus Accommodation
            </p>
          </div>

          {/* Key Specs Pills Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2.25rem' }}>
            <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E6E8EC' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                Style
              </div>
              <div style={{ fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {listing.roomType?.replace('_', ' ')}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E6E8EC' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                Policy
              </div>
              <div style={{ fontWeight: 800, textTransform: 'capitalize', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {listing.genderPreference?.replace('_', ' ')}
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E6E8EC' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                Bed Slots
              </div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {listing.totalBeds} Total Beds
              </div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #E6E8EC' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                Distance
              </div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {listing.distanceToCampus || 'Walking Dist.'}
              </div>
            </div>
          </div>

          {/* Accommodation Overview Description */}
          <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              About This Boarding Space
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {listing.description}
            </p>
          </div>

          {/* Offered Facilities & Amenities */}
          <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Facilities & Amenities
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              {listing.facilities &&
                listing.facilities.map((fac, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#EEF4FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{fac}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* 
            ========================================================================
            LOCATION & INTERACTIVE TURN-BY-TURN DIRECTIONS
            ========================================================================
          */}
          <div
            id="location-map"
            className="card"
            style={{
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid #E6E8EC',
              marginBottom: '2rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Header with Title and Address */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: '#EEF4FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                    }}
                  >
                    <MapPin size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Location & Turn-by-Turn Directions
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, paddingLeft: '3.1rem' }}>
                  {listing.address}, {listing.city}
                </p>
              </div>

              {/* Campus Proximity badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <Compass size={16} />
                <span>
                  {listing.distanceToCampus || '5 mins walk'} to {listing.nearestUniversity}
                </span>
              </div>
            </div>

            {/* Interactive Embedded OpenStreetMap */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '340px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F1F5F9',
                marginBottom: '1.25rem',
              }}
            >
              <iframe
                title={`Map of ${listing.title}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
              />

              {/* Floating Pin Label on Map */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span>{listing.title}</span>
              </div>
            </div>

            {/* Navigation Action Buttons Console */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.25rem',
              }}
            >
              {/* Primary Google Maps Navigation Button */}
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#3B71FE',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '14px',
                  boxShadow: '0 4px 14px rgba(59, 113, 254, 0.25)',
                }}
              >
                <Navigation size={18} />
                Get Directions in Google Maps
                <ExternalLink size={14} style={{ opacity: 0.85 }} />
              </a>

              {/* Walking Route Mode */}
              <a
                href={walkingDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                🚶 Walking Route
              </a>

              {/* Driving Route Mode */}
              <a
                href={drivingDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                🚗 Driving Route
              </a>

              {/* Copy Direct Route Link */}
              <button
                type="button"
                onClick={() => handleCopyMapLink(googleDirectionsUrl)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1.1rem',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: copiedLocationLink ? '#15803D' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedLocationLink ? (
                  <>
                    <CheckCheck size={16} color="#15803D" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Route Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* House Rules */}
          {listing.houseRules && listing.houseRules.length > 0 && (
            <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                House Rules & Policies
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {listing.houseRules.map((rule, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Student Reviews Section */}
          <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Verified Student Reviews
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Star size={16} fill="#FFAF38" color="#FFAF38" />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {listing.averageRating || '4.8'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ({listing.totalReviews || reviews.length} verified reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1px solid #E6E8EC',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {rev.studentId?.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {rev.studentId?.name || 'Verified Student'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            {rev.studentId?.university || 'University Student'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={13} fill="#FFAF38" color="#FFAF38" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                No reviews yet. Be the first verified student tenant to post your experience!
              </p>
            )}

            {/* Write Review Form for Verified Student Tenants */}
            {isAuthenticated && isStudent && (
              <div
                style={{
                  borderTop: '1px solid #E6E8EC',
                  paddingTop: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Write a Verified Review
                </h4>

                {reviewSuccess ? (
                  <div
                    style={{
                      color: 'var(--status-success-text)',
                      padding: '1rem',
                      backgroundColor: 'var(--status-success-bg)',
                      border: '1px solid var(--status-success-border)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                    }}
                  >
                    Thank you! Your verified review has been submitted and aggregated into the accommodation's score.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    {reviewError && (
                      <div
                        style={{
                          color: 'var(--status-danger-text)',
                          backgroundColor: 'var(--status-danger-bg)',
                          border: '1px solid var(--status-danger-border)',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          marginBottom: '1rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        {reviewError}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Overall Rating</label>
                        <select
                          className="form-select"
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Good</option>
                          <option value="3">3 - Average</option>
                          <option value="2">2 - Poor</option>
                          <option value="1">1 - Terrible</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Cleanliness</label>
                        <select
                          className="form-select"
                          value={cleanlinessRating}
                          onChange={(e) => setCleanlinessRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Communication</label>
                        <select
                          className="form-select"
                          value={commRating}
                          onChange={(e) => setCommRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Safety</label>
                        <select
                          className="form-select"
                          value={safetyRating}
                          onChange={(e) => setSafetyRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Review Feedback</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="Detail your stay experience, cleanliness, Wi-Fi speed, and landlord support..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={reviewMutation.isLoading}
                      style={{ backgroundColor: '#3B71FE', borderRadius: '12px', padding: '0.6rem 1.4rem', fontWeight: 700 }}
                    >
                      {reviewMutation.isLoading ? 'Submitting...' : 'Post Verified Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 
          ========================================================================
          RIGHT COLUMN: STICKY TRIPGUIDE BOOKING CONSOLE
          ========================================================================
        */}
        <div style={{ position: 'sticky', top: '86px' }}>
          <div
            className="card"
            style={{
              padding: '2rem',
              borderRadius: '24px',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.9)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Rent & Key Money Header */}
            <div style={{ borderBottom: '1px solid #E6E8EC', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Monthly Rent
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0.2rem 0' }}>
                Rs. {listing.rentAmount.toLocaleString()}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                  / month
                </span>
              </div>
              {listing.keyMoney > 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Key Money Deposit: <strong>Rs. {listing.keyMoney.toLocaleString()}</strong>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.35rem', fontWeight: 700 }}>
                  ✓ Zero Key Money Advance
                </div>
              )}
              <div style={{ fontSize: '0.825rem', color: listing.utilitiesIncluded ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 600 }}>
                {listing.utilitiesIncluded ? '✓ Water & Electricity Included' : 'Separate utility meters applied'}
              </div>
            </div>

            {/* Landlord Contact Info */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                Property Warden / Owner
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {listing.ownerId?.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                    {listing.ownerId?.name}
                    {listing.ownerId?.isVerified && (
                      <ShieldCheck size={16} color="var(--primary)" title="Verified Property Owner" />
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {listing.ownerId?.phone || 'Contact provided upon inquiry'}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking CTA Button */}
            {listing.availableBeds > 0 ? (
              <button
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  fontWeight: 700,
                  backgroundColor: '#3B71FE',
                  borderRadius: '16px',
                  padding: '1rem',
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px -4px rgba(59, 113, 254, 0.4)',
                }}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setBookingModalOpen(true);
                  }
                }}
              >
                Request Booking Now
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg" style={{ width: '100%', borderRadius: '16px' }} disabled>
                Currently Fully Occupied
              </button>
            )}

            <div style={{ textAlign: 'center', marginTop: '0.9rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 No upfront payment required to inquire
            </div>

            {/* Quick Directions Link in Booking Console */}
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E6E8EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                <MapPin size={14} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>{listing.city}</span>
              </div>
              <a
                href={googleDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                Get Directions <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        BOOKING REQUEST MODAL
        ========================================================================
      */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingSuccess(false);
          setBookingError('');
        }}
        title="Inquire & Reserve Bed Space"
      >
        {bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success-bg)',
                color: 'var(--status-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={30} strokeWidth={2.5} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Booking Request Sent!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Your inquiry has been submitted to <strong>{listing.ownerId?.name}</strong>. You will be notified once the landlord accepts your reservation.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setBookingModalOpen(false);
                  setBookingSuccess(false);
                }}
              >
                Close
              </button>
              <Link to="/student/bookings" className="btn btn-primary">
                View My Bookings
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit}>
            {bookingError && (
              <div
                style={{
                  color: 'var(--status-danger-text)',
                  backgroundColor: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                {bookingError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Preferred Move-in Date *</label>
              <input
                type="date"
                className="form-input"
                value={moveInDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setMoveInDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message for Property Warden</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Mention your university, faculty, course duration, and any specific questions..."
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBookingModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={bookingMutation.isLoading}
              >
                {bookingMutation.isLoading ? 'Sending Request...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 
        ========================================================================
        PHOTO LIGHTBOX POPUP MODAL (Browse all photos in full view)
        ========================================================================
      */}
      {isLightboxOpen && (
        <div
          className="lightbox-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(10, 15, 29, 0.96)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            color: '#FFFFFF',
            animation: 'fadeInLightbox 0.2s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                }}
              >
                {currentImageIndex + 1} / {allPhotos.length}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {listing.title}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {listing.city} • {listing.nearestUniversity}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem',
                }}
                className="lightbox-desktop-hint"
              >
                Navigate with <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>←</kbd> <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>→</kbd> or <kbd style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd>
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Close (Esc)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Viewing Stage */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: '1rem 4rem',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
          >
            {/* Prev Arrow */}
            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                style={{
                  position: 'absolute',
                  left: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                  transition: 'all 0.2s ease',
                }}
                title="Previous Photo (←)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
            )}

            {/* Active Photo Container */}
            <div
              style={{
                position: 'relative',
                maxWidth: '100%',
                maxHeight: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                key={currentImageIndex}
                src={allPhotos[currentImageIndex]}
                alt={`${listing.title} photo ${currentImageIndex + 1}`}
                style={{
                  maxHeight: '72vh',
                  maxWidth: '85vw',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  animation: 'zoomInLightbox 0.22s ease-out',
                }}
              />
            </div>

            {/* Next Arrow */}
            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                  transition: 'all 0.2s ease',
                }}
                title="Next Photo (→)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <ChevronRight size={28} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {allPhotos.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                overflowX: 'auto',
                maxWidth: '100%',
              }}
            >
              {allPhotos.map((photo, idx) => {
                const isActive = idx === currentImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: '68px',
                      height: '48px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: 0,
                      border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                      opacity: isActive ? 1 : 0.5,
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isActive ? '0 0 14px rgba(59, 113, 254, 0.8)' : 'none',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Responsive Layout & Lightbox Styles */}
      <style>{`
        .gallery-zoom-img {
          transition: transform 0.35s ease;
        }
        .trip-guide-gallery div:hover .gallery-zoom-img,
        .trip-guide-gallery:hover .gallery-zoom-img {
          transform: scale(1.03);
        }
        .gallery-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.35);
          backdrop-filter: blur(1px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.9rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .trip-guide-gallery div:hover .gallery-hover-overlay {
          opacity: 1;
        }
        .btn-view-all-photos:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22) !important;
          background-color: #FFFFFF !important;
        }
        @keyframes fadeInLightbox {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomInLightbox {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          .trip-guide-gallery {
            grid-template-columns: 1fr !important;
            height: clamp(260px, 50vw, 380px) !important;
          }
          .secondary-photos-column {
            display: none !important;
          }
          .details-layout {
            grid-template-columns: 1fr !important;
          }
          .lightbox-desktop-hint {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
