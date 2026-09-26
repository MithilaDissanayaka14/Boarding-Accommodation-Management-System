import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  Building2,
  Plus,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isStudent, isLandlord, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-hairline)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        className="container-hero"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3B71FE 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 113, 254, 0.35)',
            }}
          >
            <Home size={20} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              Uni<span style={{ color: 'var(--primary)' }}>Stay</span>
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              Campus Boarding
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/listings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              color: isActive('/listings') ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive('/listings') ? 'var(--primary-subtle)' : 'transparent',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Compass size={17} strokeWidth={2} />
            Explore Places
          </Link>

          {isAuthenticated && isStudent && (
            <Link
              to="/student/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                color: location.pathname.startsWith('/student') ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: location.pathname.startsWith('/student') ? 'var(--primary-subtle)' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              <GraduationCap size={18} strokeWidth={2} />
              Student Portal
            </Link>
          )}

          {isAuthenticated && isLandlord && (
            <>
              <Link
                to="/landlord/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  color: location.pathname.startsWith('/landlord') ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: location.pathname.startsWith('/landlord') ? 'var(--primary-subtle)' : 'transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Building2 size={17} strokeWidth={2} />
                Landlord Hub
              </Link>
              <Link
                to="/landlord/create-listing"
                className="btn btn-secondary btn-sm"
                style={{
                  gap: '0.35rem',
                  border: '1px dashed var(--primary)',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-subtle)',
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                Post Listing
              </Link>
            </>
          )}
        </div>

        {/* Right Authentication CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.3rem 0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {user.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Log out"
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                }}
              >
                <LogOut size={17} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              color: 'var(--text-primary)',
              display: 'flex',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}
            className="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-hairline)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Link
            to="/listings"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            <Compass size={18} color="var(--primary)" />
            Explore Places
          </Link>

          {isAuthenticated && isStudent && (
            <Link
              to="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <GraduationCap size={18} color="var(--primary)" />
              Student Portal
            </Link>
          )}

          {isAuthenticated && isLandlord && (
            <>
              <Link
                to="/landlord/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                <Building2 size={18} color="var(--primary)" />
                Landlord Hub
              </Link>
              <Link
                to="/landlord/create-listing"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
              >
                <Plus size={18} />
                Post Listing
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
