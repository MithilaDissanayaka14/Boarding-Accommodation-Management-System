import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../../services/listingService';
import { ListingCard } from '../../components/listings/ListingCard';
import { ListingGridSkeleton } from '../../components/common/SkeletonLoader';
import {
  Search,
  MapPin,
  Calendar,
  Bed,
  Users,
  Building,
  Home as HomeIcon,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const POPULAR_UNIVERSITIES = [
  { name: 'SLIIT Malabe', query: 'SLIIT', count: '500+ Students' },
  { name: 'NSBM Green Univ.', query: 'NSBM', count: '400+ Students' },
  { name: 'Moratuwa (UoM)', query: 'UoM', count: 'Katubedda Hub' },
  { name: 'Colombo (UoC)', query: 'UoC', count: 'Colombo 03/07' },
  { name: 'Kelaniya (UoK)', query: 'UoK', count: 'Dalugama Zone' },
  { name: 'CINEC Campus', query: 'CINEC', count: 'Malabe Zone' },
];

export const Home = () => {
  const navigate = useNavigate();

  // Search console states
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'shared_room', 'single_room', 'annex'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'boys_only', 'girls_only'
  const [occupantsFilter, setOccupantsFilter] = useState('1'); // '1', '2', '3+'
  const [selectedUni, setSelectedUni] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [budgetInput, setBudgetInput] = useState('');

  // Fetch top-rated accommodations
  const { data, isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: () => listingService.getListings({ limit: 8, sort: 'rating-desc' }),
  });

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.append('roomType', activeTab);
    if (genderFilter !== 'all') params.append('genderPreference', genderFilter);
    if (selectedUni) params.append('university', selectedUni);
    if (cityInput.trim()) params.append('city', cityInput.trim());
    if (budgetInput) params.append('maxRent', budgetInput);
    navigate(`/listings?${params.toString()}`);
  };

  const listings = data?.data?.listings || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 5vw, 5rem)', paddingBottom: '4rem' }}>
      {/* 
        ========================================================================
        HERO SECTION - Full Widescreen Immersion (1920p/1440p) + Fluid Mobile
        ========================================================================
      */}
      <section style={{ position: 'relative', width: '100%', paddingTop: 'clamp(0.5rem, 1.5vw, 1.25rem)' }}>
        <div className="container-hero" style={{ position: 'relative' }}>
          
          {/* Main Landscape Photographic Banner */}
          <div
            className="hero-landscape-banner"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: 'clamp(460px, 58vh, 620px)',
              borderRadius: 'clamp(18px, 2.5vw, 32px)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -15px rgba(15, 23, 42, 0.2)',
              backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=85')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 50%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
            }}
          >
            {/* Atmospheric gradient overlay for typography readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.35) 45%, rgba(15, 23, 42, 0.08) 85%)',
                zIndex: 1,
              }}
            />

            {/* Overlaid Display Typography */}
            <div className="hero-text-overlay" style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  color: '#FFFFFF',
                  fontSize: 'clamp(0.72rem, 1vw, 0.8rem)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                }}
              >
                <Sparkles size={14} color="#FFAF38" /> Official University Living Network
              </div>

              <h1
                style={{
                  color: '#FFFFFF',
                  fontSize: 'clamp(2.1rem, 5.2vw, 4.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.035em',
                  textShadow: '0 3px 14px rgba(0, 0, 0, 0.35)',
                  margin: 0,
                }}
              >
                Book With Us<br />
                Enjoy your<br />
                Campus Life !
              </h1>
            </div>
          </div>

          {/* 
            ====================================================================
            FLOATING SEARCH CONSOLE (Overlapping bottom edge of hero image)
            ====================================================================
          */}
          <div
            className="search-console hero-floating-console"
            style={{
              maxWidth: '1220px',
              position: 'relative',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow:
                '0 30px 60px -15px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Console Top Row: Room Types Tabs & Filter Pills */}
            <div className="hero-tabs-row">
              {/* Left: Accommodation Category Tabs */}
              <div className="hero-category-tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`tab-btn ${activeTab === 'all' ? 'tab-btn-active' : ''}`}
                >
                  <Bed size={16} color={activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>All Stays</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('shared_room')}
                  className={`tab-btn ${activeTab === 'shared_room' ? 'tab-btn-active' : ''}`}
                >
                  <Users size={16} color={activeTab === 'shared_room' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>Shared Rooms</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('single_room')}
                  className={`tab-btn ${activeTab === 'single_room' ? 'tab-btn-active' : ''}`}
                >
                  <HomeIcon size={16} color={activeTab === 'single_room' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>Single Rooms</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('annex')}
                  className={`tab-btn ${activeTab === 'annex' ? 'tab-btn-active' : ''}`}
                >
                  <Building size={16} color={activeTab === 'annex' ? 'var(--primary)' : 'var(--text-muted)'} />
                  <span>Annex / House</span>
                </button>
              </div>

              {/* Right: Dropdown Filter Pills */}
              <div className="hero-filter-pills">
                {/* Gender Policy Pill */}
                <div style={{ position: 'relative', flex: '1 1 auto' }}>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    style={{
                      width: '100%',
                      appearance: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.45rem 2rem 0.45rem 1rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <option value="all">Gender: Any</option>
                    <option value="boys_only">Boys Only</option>
                    <option value="girls_only">Girls Only</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                </div>

                {/* Occupants Pill */}
                <div style={{ position: 'relative', flex: '1 1 auto' }}>
                  <select
                    value={occupantsFilter}
                    onChange={(e) => setOccupantsFilter(e.target.value)}
                    style={{
                      width: '100%',
                      appearance: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.45rem 2rem 0.45rem 1rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    <option value="1">1 Student</option>
                    <option value="2">2 Students</option>
                    <option value="3+">3+ Students</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Console Bottom Row: Input Wells & Search Button */}
            <form onSubmit={handleHeroSearch}>
              <div className="search-wells-grid">
                {/* Well 1: Location / University */}
                <div className="search-field-well">
                  <span className="well-label">Location</span>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.45rem' }}>
                    <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <select
                      value={selectedUni}
                      onChange={(e) => setSelectedUni(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        width: '100%',
                        cursor: 'pointer',
                        padding: '2px 0',
                      }}
                    >
                      <option value="">Where are you studying?</option>
                      <option value="SLIIT">SLIIT (Malabe Hub)</option>
                      <option value="NSBM">NSBM Green University (Homagama)</option>
                      <option value="UoM">Moratuwa University (Katubedda)</option>
                      <option value="UoC">Colombo University (Colombo 03/07)</option>
                      <option value="UoK">Kelaniya University (Dalugama)</option>
                      <option value="CINEC">CINEC Campus (Malabe)</option>
                      <option value="Horizon">Horizon Campus (Malabe)</option>
                    </select>
                  </div>
                </div>

                {/* Well 2: Check-in / Move-in Date */}
                <div className="search-field-well">
                  <span className="well-label">Check in</span>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.45rem' }}>
                    <Calendar size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      placeholder="Add date"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: moveInDate ? 'var(--text-primary)' : 'var(--text-muted)',
                        width: '100%',
                        cursor: 'pointer',
                        padding: '2px 0',
                      }}
                    />
                  </div>
                </div>

                {/* Well 3: Max Budget */}
                <div className="search-field-well">
                  <span className="well-label">Max Budget</span>
                  <select
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      width: '100%',
                      cursor: 'pointer',
                      padding: '2px 0',
                    }}
                  >
                    <option value="">Any Budget</option>
                    <option value="15000">Under Rs. 15,000</option>
                    <option value="25000">Under Rs. 25,000</option>
                    <option value="40000">Under Rs. 40,000</option>
                    <option value="60000">Under Rs. 60,000</option>
                  </select>
                </div>

                {/* Well 4: Large Royal Blue Search Action Button */}
                <button
                  type="submit"
                  className="btn btn-primary hero-search-btn"
                  style={{
                    backgroundColor: '#3B71FE',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px -4px rgba(59, 113, 254, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                  }}
                >
                  <Search size={19} strokeWidth={2.5} />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

          {/* 
            ====================================================================
            CENTERED PROMOTIONAL HEADLINE DIRECTLY BELOW SEARCH CONSOLE
            ====================================================================
          */}
          <div style={{ textAlign: 'center', maxWidth: '860px', margin: 'clamp(2.5rem, 5vw, 4rem) auto 1.5rem', padding: '0 1rem' }}>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: '0.85rem',
                lineHeight: 1.2,
              }}
            >
              Search a best place in the university zones
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '680px',
                margin: '0 auto 1.75rem',
              }}
            >
              Whether you're looking for shared student rooms, private studio annexes, or whole houses near your campus, we are here to guide you with verified listings, accurate bed counts, and transparent key money.
            </p>

            {/* Quick University Hub Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Frequent Hubs:</span>
              {POPULAR_UNIVERSITIES.map((uni) => (
                <button
                  key={uni.query}
                  type="button"
                  onClick={() => navigate(`/listings?university=${uni.query}`)}
                  style={{
                    padding: '0.35rem 0.95rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E6E8EC',
                    color: 'var(--text-secondary)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-subtle)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E6E8EC';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {uni.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        FEATURED ACCOMMODATIONS GRID (Expansive 4-Column on Widescreen)
        ========================================================================
      */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.25rem' }}>
              Handpicked Student Places
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Top-Rated Accommodations
            </h2>
          </div>
          <Link
            to="/listings"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            View All ({listings.length}) <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No accommodations available right now.
          </div>
        )}
      </section>

      {/* 
        ========================================================================
        HOW UNISTAY WORKS - 4 Clean Cards
        ========================================================================
      */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)', padding: 'clamp(3.5rem, 6vw, 5rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto clamp(2.5rem, 4vw, 3.5rem)' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem' }}>
              Streamlined Student Living
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              How UniStay Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              A full-lifecycle accommodation management system replacing informal agreements, lost bank slips, and untracked repair requests.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                01
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Filter by Campus
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Filter rooms by university walking distance, monthly budget in LKR, gender preference, and facilities like fiber Wi-Fi or study desks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                02
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Inquire & Book
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Select your intended move-in date and send an inquiry. Landlords accept requests with atomic per-bed slot occupancy management.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                03
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Settle Rent Slips
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Receive monthly rent invoices, upload your bank transfer slip, and get direct landlord verification inside your student ledger.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                }}
              >
                04
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Repairs & Reviews
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Submit repair tickets with a 3-stage progress tracker, and leave verified ratings at the end of your semester stay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        LANDLORD CALLOUT BANNER
        ========================================================================
      */}
      <section className="container">
        <div
          style={{
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B71FE 100%)',
            borderRadius: '24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            boxShadow: '0 20px 45px -15px rgba(37, 99, 235, 0.4)',
          }}
          className="landlord-callout"
        >
          <div style={{ maxWidth: '620px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              Property Owners & Wardens
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.25rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.85rem', color: '#FFFFFF' }}>
              List Your Boarding Space for Verified Students
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', lineHeight: 1.6 }}>
              Receive booking requests with student verification. Automate monthly rent invoices, verify bank slips, and handle repair issues without friction.
            </p>
          </div>
          <div>
            <Link
              to="/register"
              className="btn btn-secondary btn-lg"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#2563EB',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                borderRadius: '16px',
                padding: '0.9rem 2rem',
              }}
            >
              Register Property Free
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        RESPONSIVE MEDIA QUERIES (DESKTOP / WIDESCREEN / TABLET / MOBILE)
        ========================================================================
      */}
      <style>{`
        /* Desktop Base Styling */
        .hero-text-overlay {
          top: clamp(2.5rem, 5vw, 4.5rem);
          left: clamp(2rem, 5vw, 5rem);
          max-width: 640px;
        }

        .hero-floating-console {
          margin: -90px auto 0;
          width: calc(100% - clamp(1rem, 4vw, 4rem));
          padding: 1.5rem 2rem 1.75rem;
        }

        .hero-tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #E6E8EC;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          gap: 1rem;
        }

        .hero-category-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hero-filter-pills {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          background-color: transparent;
          border: 1px solid transparent;
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .hero-floating-console {
          margin: -90px auto 0;
          width: calc(100% - clamp(1rem, 4vw, 4rem));
          padding: 1.5rem 2rem 1.75rem;
          background: rgba(255, 255, 255, 0.78) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 30px 60px -15px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.7), inset 0 1px 2px rgba(255, 255, 255, 0.95) !important;
        }

        .tab-btn-active {
          font-weight: 700 !important;
          color: var(--primary) !important;
          background-color: rgba(59, 113, 254, 0.12) !important;
          border: 1px solid rgba(59, 113, 254, 0.28) !important;
          backdrop-filter: blur(8px) !important;
          box-shadow: 0 2px 8px rgba(59, 113, 254, 0.12) !important;
        }

        .search-wells-grid {
          display: grid;
          grid-template-columns: minmax(260px, 2.2fr) minmax(180px, 1.3fr) minmax(180px, 1.3fr) auto;
          gap: 0.85rem;
          align-items: stretch;
        }

        .search-field-well {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 0.85rem 1.25rem;
          min-height: 64px;
          background: rgba(244, 245, 246, 0.72) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          border-radius: 16px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02) !important;
          transition: all var(--transition-fast);
        }

        .search-field-well:hover, .search-field-well:focus-within {
          background: rgba(255, 255, 255, 0.94) !important;
          border-color: rgba(59, 113, 254, 0.35) !important;
          box-shadow: 0 4px 16px rgba(59, 113, 254, 0.1), inset 0 1px 1px #FFFFFF !important;
        }

        .well-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 3px;
        }

        .hero-search-btn {
          padding: 0 2.4rem;
          height: 100%;
          min-height: 64px;
        }

        /* Tablet Breakpoint (max-width: 1024px) */
        @media (max-width: 1024px) {
          .hero-floating-console {
            margin-top: -60px;
            padding: 1.25rem 1.5rem 1.5rem;
          }
          .search-wells-grid {
            grid-template-columns: 1fr 1fr;
          }
          .hero-search-btn {
            grid-column: span 2;
            min-height: 52px;
          }
        }

        /* Mobile Breakpoint (max-width: 768px) */
        @media (max-width: 768px) {
          .hero-landscape-banner {
            min-height: 380px !important;
            height: auto !important;
            padding-bottom: 2rem !important;
            border-radius: 20px !important;
          }

          .hero-text-overlay {
            top: 1.75rem !important;
            left: 1.25rem !important;
            right: 1.25rem !important;
          }

          .hero-floating-console {
            margin-top: -30px !important;
            width: 100% !important;
            border-radius: 20px !important;
            padding: 1.25rem 1rem !important;
          }

          .hero-tabs-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
            padding-bottom: 0.85rem !important;
          }

          .hero-category-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 4px !important;
          }

          .tab-btn {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            padding: 0.4rem 0.85rem !important;
            font-size: 0.825rem !important;
          }

          .hero-filter-pills {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
          }

          .search-wells-grid {
            grid-template-columns: 1fr !important;
            gap: 0.65rem !important;
          }

          .search-field-well {
            padding: 0.75rem 1rem !important;
            min-height: 54px !important;
          }

          .hero-search-btn {
            grid-column: span 1 !important;
            width: 100% !important;
            min-height: 52px !important;
            margin-top: 0.25rem !important;
          }

          .landlord-callout {
            flex-direction: column !important;
            align-items: flex-start !important;
            text-align: left !important;
          }
          .landlord-callout a {
            width: 100% !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};
