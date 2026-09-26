import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, Building, GraduationCap, Home } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        phone,
        university: role === 'student' ? university : undefined,
      });

      if (role === 'landlord') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 140px)',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #3B71FE 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(59, 113, 254, 0.3)',
            }}
          >
            <Home size={22} color="#FFFFFF" strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Join UniStay to discover or list university student accommodations
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '4px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-hairline)',
            marginBottom: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              backgroundColor: role === 'student' ? '#FFFFFF' : 'transparent',
              color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'student' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            type="button"
            onClick={() => setRole('landlord')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              backgroundColor: role === 'landlord' ? '#FFFFFF' : 'transparent',
              color: role === 'landlord' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'landlord' ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Building size={16} /> Landlord
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--status-danger-text)',
              backgroundColor: 'var(--status-danger-bg)',
              border: '1px solid var(--status-danger-border)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Kamal Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. student@sliit.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone (+94)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. +94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label className="form-label">University / Institute</label>
              <select
                className="form-select"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
              >
                <option value="">Select your University...</option>
                <option value="SLIIT">SLIIT (Malabe)</option>
                <option value="NSBM">NSBM Green University</option>
                <option value="UoM">Moratuwa University (UoM)</option>
                <option value="UoC">Colombo University (UoC)</option>
                <option value="UoK">Kelaniya University (UoK)</option>
                <option value="CINEC">CINEC Campus</option>
                <option value="Horizon">Horizon Campus</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password (min. 6 characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontWeight: 700 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
