import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../../services/listingService';
import {
  Building2,
  UploadCloud,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Sparkles,
  MapPin,
  Check,
  FileText,
  Images,
  Navigation,
  Compass,
  ExternalLink,
  LocateFixed,
  CheckCircle2,
} from 'lucide-react';

const UNIVERSITIES = [
  'SLIIT',
  'NSBM',
  'UoM',
  'UoC',
  'UoK',
  'USJ',
  'CINEC',
  'Horizon',
];

const CAMPUS_PRESETS = [
  { name: 'SLIIT Malabe', city: 'Malabe', uni: 'SLIIT', lat: 6.9148, lng: 79.9733, distance: '400m (5 mins walk)' },
  { name: 'NSBM Homagama', city: 'Homagama', uni: 'NSBM', lat: 6.8213, lng: 80.0416, distance: '600m (7 mins walk)' },
  { name: 'UoM Katubedda', city: 'Katubedda', uni: 'UoM', lat: 6.7969, lng: 79.9018, distance: '500m (6 mins walk)' },
  { name: 'UoC Colombo 07', city: 'Colombo 07', uni: 'UoC', lat: 6.9000, lng: 79.8588, distance: '800m (10 mins walk)' },
  { name: 'UoK Kelaniya', city: 'Kelaniya', uni: 'UoK', lat: 6.9744, lng: 79.9161, distance: '700m (8 mins walk)' },
  { name: 'CINEC Campus', city: 'Malabe', uni: 'CINEC', lat: 6.9135, lng: 79.9708, distance: '350m (4 mins walk)' },
];

const AVAILABLE_FACILITIES = [
  'Wi-Fi',
  'Attached Bathroom',
  'Common Bathroom',
  'Study Desk',
  'Hot Water',
  'Solar Hot Water',
  'Kitchen Sharing',
  'Parking',
  'Balcony',
  'Power Backup',
  'CCTV Security',
];

export const CreateListing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Malabe');
  const [nearestUniversity, setNearestUniversity] = useState('SLIIT');
  const [distanceToCampus, setDistanceToCampus] = useState('500m (5 mins walk)');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [keyMoney, setKeyMoney] = useState('');
  const [roomType, setRoomType] = useState('shared');
  const [totalBeds, setTotalBeds] = useState(2);
  const [availableBeds, setAvailableBeds] = useState(2);
  const [genderPreference, setGenderPreference] = useState('boys_only');
  const [facilities, setFacilities] = useState(['Wi-Fi', 'Attached Bathroom', 'Study Desk']);
  const [houseRules, setHouseRules] = useState('No smoking inside\nCurfew at 10:30 PM\nQuiet hours after 10 PM');
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');

  const createListingMutation = useMutation({
    mutationFn: (formData) => listingService.createListing(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['landlord-properties']);
      queryClient.invalidateQueries(['listings']);
      navigate('/landlord/dashboard');
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to publish accommodation listing');
    },
  });

  const handleFacilityToggle = (fac) => {
    setFacilities((prev) =>
      prev.includes(fac) ? prev.filter((f) => f !== fac) : [...prev, fac]
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationNotice('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
        setIsLocating(false);
        setLocationNotice(`Exact GPS coordinates detected (${lat}, ${lng})!`);
      },
      (err) => {
        setIsLocating(false);
        setError('Could not detect device location. Please check browser permissions or select a campus preset.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleApplyPreset = (preset) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setCity(preset.city);
    setNearestUniversity(preset.uni);
    setDistanceToCampus(preset.distance);
    setGoogleMapsUrl(`https://www.google.com/maps?q=${preset.lat},${preset.lng}`);
    setLocationNotice(`Set location coordinates near ${preset.name}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('nearestUniversity', nearestUniversity);
    formData.append('distanceToCampus', distanceToCampus);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    if (googleMapsUrl) formData.append('googleMapsUrl', googleMapsUrl);
    formData.append('rentAmount', Number(rentAmount));
    formData.append('keyMoney', Number(keyMoney || 0));
    formData.append('roomType', roomType);
    formData.append('totalBeds', Number(totalBeds));
    formData.append('availableBeds', Number(availableBeds));
    formData.append('genderPreference', genderPreference);
    formData.append('utilitiesIncluded', utilitiesIncluded);

    facilities.forEach((fac) => formData.append('facilities[]', fac));

    const rulesArray = houseRules.split('\n').filter((r) => r.trim() !== '');
    rulesArray.forEach((r) => formData.append('houseRules[]', r.trim()));

    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    createListingMutation.mutate(formData);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '860px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/landlord/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1rem',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              Publish New Boarding Listing
            </h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginLeft: '3.25rem' }}>
          Create an attractive listing for university students. Clear details and accurate bed slots help you get verified inquiries faster.
        </p>
      </div>

      <div className="card" style={{ padding: '2.25rem' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#B91C1C',
              background: 'var(--status-danger-bg)',
              padding: '0.875rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              border: '1px solid var(--status-danger-border)',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Section 1: Overview & Location */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <MapPin size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                1. Accommodation Overview & Location
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Accommodation Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Green Villa Modern Annex (Near SLIIT Main Gate)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City / Suburb *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Malabe, Homagama, Katubedda"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nearest University *</label>
                  <select
                    className="form-select"
                    value={nearestUniversity}
                    onChange={(e) => setNearestUniversity(e.target.value)}
                    required
                  >
                    {UNIVERSITIES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Distance to Campus</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 500m (5 mins walk)"
                    value={distanceToCampus}
                    onChange={(e) => setDistanceToCampus(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. No. 45, Kaduwela Road, Malabe"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* Boarding House GPS Pin & Directions Console */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={18} color="var(--primary)" />
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        House GPS Coordinates & Direct Navigation
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Provide exact coordinates so students can tap <strong>"Get Directions"</strong> to navigate directly to your boarding place.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <LocateFixed size={14} color="var(--primary)" />
                    {isLocating ? 'Detecting Location...' : 'Use My Current Location'}
                  </button>
                </div>

                {/* Quick campus preset chips */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Or select a nearest campus preset to autofill coordinates:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {CAMPUS_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.color = 'var(--primary)';
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        📍 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {locationNotice && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--status-success-bg)',
                      color: 'var(--status-success-text)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{locationNotice}</span>
                  </div>
                )}

                {/* Coordinate Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Latitude (e.g. 6.9148)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 6.9148"
                      value={latitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLatitude(val);
                        if (val && longitude) {
                          setGoogleMapsUrl(`https://www.google.com/maps?q=${val},${longitude}`);
                        }
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Longitude (e.g. 79.9733)</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 79.9733"
                      value={longitude}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLongitude(val);
                        if (latitude && val) {
                          setGoogleMapsUrl(`https://www.google.com/maps?q=${latitude},${val}`);
                        }
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>
                      Google Maps Direct / Share URL (Optional)
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://maps.google.com/?q=..."
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Live Interactive Map Pin Preview */}
                {latitude && longitude && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        🗺️ Live OpenStreetMap Pin Preview:
                      </span>
                      <a
                        href={googleMapsUrl || `https://www.google.com/maps?q=${latitude},${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        Preview Navigation <ExternalLink size={12} />
                      </a>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '180px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#E2E8F0',
                      }}
                    >
                      <iframe
                        title="Listing Location Preview"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.006}%2C${Number(latitude) - 0.004}%2C${Number(longitude) + 0.006}%2C${Number(latitude) + 0.004}&layer=mapnik&marker=${latitude}%2C${longitude}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Describe the rooms, environment, study atmosphere, security features, and neighborhood conveniences..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Bed Capacity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <DollarSign size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                2. Pricing & Bed Slot Capacity
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Monthly Rent (LKR) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 16000"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Key Money / Security Deposit (LKR)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 32000"
                    value={keyMoney}
                    onChange={(e) => setKeyMoney(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Room Type</label>
                  <select
                    className="form-select"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="single">Single Private Room</option>
                    <option value="shared">Shared Room (Per Bed)</option>
                    <option value="annex">Full Annex / House</option>
                    <option value="apartment">Apartment Unit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={totalBeds}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalBeds(val);
                      if (availableBeds > val) setAvailableBeds(val);
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Currently Available Beds *</label>
                  <input
                    type="number"
                    min="0"
                    max={totalBeds}
                    className="form-input"
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gender Preference</label>
                  <select
                    className="form-select"
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value)}
                  >
                    <option value="any">Any Gender Allowed</option>
                    <option value="boys_only">Boys Only 👨‍🎓</option>
                    <option value="girls_only">Girls Only 👩‍🎓</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-muted)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={utilitiesIncluded}
                    onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer',
                    }}
                  />
                  <span>Water & Electricity Bills Included in Monthly Rent</span>
                </label>
                <p style={{ margin: '0.35rem 0 0 1.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Check this if students do not need to settle separate utility utility bills every month.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Facilities & House Rules */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                3. Amenities & House Rules
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>Select Available Amenities</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem' }}>
                  {AVAILABLE_FACILITIES.map((fac) => {
                    const isSelected = facilities.includes(fac);
                    return (
                      <div
                        key={fac}
                        onClick={() => handleFacilityToggle(fac)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            border: isSelected ? 'none' : '1px solid var(--border-strong)',
                            background: isSelected ? 'var(--accent-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                          }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span>{fac}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">House Rules (One rule per line)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  placeholder="e.g.&#10;No smoking inside&#10;Curfew at 10:30 PM&#10;No loud music after 10 PM"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Property Photos */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <Images size={18} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                4. Property Photographs
              </h2>
            </div>

            <div
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                background: 'var(--bg-muted)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onDragOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onDragLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <UploadCloud size={24} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Drag & Drop or Click to Select Photos
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Upload room, bathroom, desk area, and entrance images (JPEG, PNG, WebP up to 5MB each)
              </p>
              {imageFiles.length > 0 && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'var(--status-success-bg)',
                    color: 'var(--status-success-text)',
                    border: '1px solid var(--status-success-border)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginTop: '0.75rem',
                  }}
                >
                  <Check size={14} />
                  <span>{imageFiles.length} photo(s) selected ready to upload</span>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Link to="/landlord/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={createListingMutation.isLoading}
              style={{ minWidth: '200px' }}
            >
              {createListingMutation.isLoading ? 'Publishing...' : 'Publish Boarding Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

