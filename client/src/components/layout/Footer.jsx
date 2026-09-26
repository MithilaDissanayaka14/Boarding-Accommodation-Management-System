import React from 'react';
import { Home, ShieldCheck, MapPin, Compass, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-hairline)',
        padding: '3.5rem 0 2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Home size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Uni<span style={{ color: 'var(--primary)' }}>Stay</span>
              </span>
            </div>
            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Sri Lanka's verified university student boarding portal. Connecting undergraduates with trustworthy landlords across Malabe, Homagama, Katubedda, and Kelaniya.
            </p>
          </div>

          {/* Column 2: Popular University Hubs */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Campus Hubs
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link
                  to="/listings?university=SLIIT"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}
                >
                  <MapPin size={14} color="var(--primary)" /> SLIIT / CINEC / Horizon (Malabe)
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?university=NSBM"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}
                >
                  <MapPin size={14} color="var(--primary)" /> NSBM Green University (Homagama)
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?university=UoM"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}
                >
                  <MapPin size={14} color="var(--primary)" /> Moratuwa University (Katubedda)
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?university=UoK"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}
                >
                  <MapPin size={14} color="var(--primary)" /> University of Kelaniya (Dalugama)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Platform Features
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-secondary)' }}>
              <li>Live Per-Bed Slot Availability</li>
              <li>Monthly Rent Slip Verification Desk</li>
              <li>Maintenance Ticketing & Updates</li>
              <li>Verified Tenancy Peer Reviews</li>
            </ul>
          </div>

          {/* Column 4: Trust & Verification */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
              Trust & Safety
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>Verified Tenancy Shield</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Only students with confirmed tenancies can publish reviews. All rent transfers are securely cataloged with verified receipts.
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-hairline)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            &copy; {new Date().getFullYear()} UniStay Boarding Accommodation Management System.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
            Engineered for Sri Lankan University Communities
          </div>
        </div>
      </div>
    </footer>
  );
};
