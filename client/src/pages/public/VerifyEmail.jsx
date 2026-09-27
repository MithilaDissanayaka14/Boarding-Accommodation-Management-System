import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLandlord } = useAuth();

  const queryEmail = searchParams.get('email');
  const [email, setEmail] = useState(queryEmail || user?.email || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // Countdown timer for Resend OTP (60 seconds)
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Keep email updated if user loads
  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData.split(''));
      const lastInput = document.getElementById('verify-otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please provide your email address');
      return;
    }

    setError('');
    setInfoMsg('');
    setResending(true);

    try {
      const res = await authService.sendVerificationOtp(email.trim());
      setInfoMsg(res.message || 'A fresh verification code was sent to your email.');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      setError('Please provide your email address');
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmailOtp({
        email: email.trim(),
        otp: fullOtp,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code');
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
          maxWidth: '460px',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: success
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3B71FE 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: success
                ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                : '0 4px 14px rgba(59, 113, 254, 0.3)',
            }}
          >
            {success ? (
              <CheckCircle2 size={24} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <ShieldCheck size={24} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {success ? (
              'Congratulations! Your UniStay email address has been verified. You can now use all student and tenancy features.'
            ) : (
              <>
                Enter the 6-digit OTP code sent to{' '}
                <strong>{email || 'your email'}</strong>
              </>
            )}
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Info Alert */}
        {infoMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--status-success-text)',
              backgroundColor: 'var(--status-success-bg)',
              border: '1px solid var(--status-success-border)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{infoMsg}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleVerifyOtp}>
            {/* If no email known, allow input */}
            {!queryEmail && !user?.email && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Account Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="e.g. student@sliit.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                6-Digit OTP Code
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                }}
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`verify-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRadius: 'var(--radius-md)',
                      border: digit ? '2px solid var(--primary)' : '1px solid var(--border-hairline)',
                      backgroundColor: digit ? 'var(--primary-subtle)' : '#FAFCFF',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Resend Option */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                marginBottom: '1.5rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Didn't receive the email?</span>
              {countdown > 0 ? (
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <RefreshCw size={13} />
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Email Address'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
              Back to{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onClick={() => {
                if (isAuthenticated) {
                  navigate(isLandlord ? '/landlord/dashboard' : '/student/dashboard');
                } else {
                  navigate('/login');
                }
              }}
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In Now'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
