import React from 'react';
import { SlidersHorizontal, RotateCcw, Search, MapPin, Check } from 'lucide-react';

const UNIVERSITIES = [
  { label: 'All Campuses', value: 'all' },
  { label: 'SLIIT (Malabe)', value: 'SLIIT' },
  { label: 'NSBM Green University', value: 'NSBM' },
  { label: 'Moratuwa (UoM)', value: 'UoM' },
  { label: 'Colombo (UoC)', value: 'UoC' },
  { label: 'Kelaniya (UoK)', value: 'UoK' },
  { label: 'Sri Jayewardenepura', value: 'USJ' },
  { label: 'CINEC Campus', value: 'CINEC' },
  { label: 'Horizon Campus', value: 'Horizon' },
];

const ROOM_TYPES = [
  { label: 'All Styles', value: 'all' },
  { label: 'Single Room', value: 'single' },
  { label: 'Shared (Per Bed)', value: 'shared' },
  { label: 'Full Annex', value: 'annex' },
  { label: 'Apartment', value: 'apartment' },
];

const GENDER_OPTIONS = [
  { label: 'Any', value: 'all' },
  { label: 'Boys Only', value: 'boys_only' },
  { label: 'Girls Only', value: 'girls_only' },
];

const POPULAR_FACILITIES = [
  'Wi-Fi',
  'Attached Bathroom',
  'Study Desk',
  'Hot Water',
  'Kitchen Sharing',
  'Parking',
  'Solar Hot Water',
];

export const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const handleFacilityToggle = (facility) => {
    const current = filters.facilities || [];
    const updated = current.includes(facility)
      ? current.filter((f) => f !== facility)
      : [...current, facility];
    onFilterChange('facilities', updated);
  };

  return (
    <aside
      className="card"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem',
        position: 'sticky',
        top: '86px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          <SlidersHorizontal size={17} color="var(--primary)" strokeWidth={2.2} />
          <span>Faceted Filters</span>
        </div>
        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          title="Reset all filters"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* University Campus Filter */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={13} color="var(--primary)" />
          Target Campus
        </label>
        <select
          className="form-select"
          value={filters.university || 'all'}
          onChange={(e) => onFilterChange('university', e.target.value)}
        >
          {UNIVERSITIES.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      {/* City / Area Search */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Suburb / Town</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Malabe, Katubedda..."
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem' }}
          />
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>
      </div>

      {/* Price Budget Filter */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <label className="form-label" style={{ margin: 0 }}>Max Budget</label>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            Rs. {Number(filters.maxRent || 40000).toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="60000"
          step="2500"
          value={filters.maxRent || 40000}
          onChange={(e) => onFilterChange('maxRent', e.target.value)}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>
          <span>Rs. 5,000</span>
          <span>Rs. 60,000+</span>
        </div>
      </div>

      {/* Room Style Filter */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Accommodation Style</label>
        <select
          className="form-select"
          value={filters.roomType || 'all'}
          onChange={(e) => onFilterChange('roomType', e.target.value)}
        >
          {ROOM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Policy Segmented Controls */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Gender Policy</label>
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--border-hairline)',
          }}
        >
          {GENDER_OPTIONS.map((g) => {
            const isSelected = (filters.genderPreference || 'all') === g.value;
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => onFilterChange('genderPreference', g.value)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Checkboxes */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Facilities & Amenities</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '180px', overflowY: 'auto' }}>
          {POPULAR_FACILITIES.map((facility) => {
            const isChecked = (filters.facilities || []).includes(facility);
            return (
              <label
                key={facility}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.825rem',
                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isChecked ? 600 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                {facility}
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
