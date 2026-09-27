import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1: 'EMAIL_ENTRY' -> Step 2: 'OTP_AND_RESET' -> Step 3: 'SUCCESS'
  const [step, setStep] = useState('EMAIL_ENTRY');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for Resend OTP (60 seconds)
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle single digit OTP input & auto-focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle paste in OTP input (e.g. user copies 6-digit code)
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      const lastInput = document.getElementById('otp-input-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 1: Send Password Reset OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authService.forgotPasswordOtp(email.trim());
      setSuccessMsg(res.message || 'Verification code sent to your email.');
      setStep('OTP_AND_RESET');
      setCountdown(60); // Start 60-second cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPasswordOtp({
        email: email.trim(),
        otp: fullOtp,
        newPassword,
      });

      setSuccessMsg(res.message || 'Password reset successfully!');
      setStep('SUCCESS');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your OTP code.');
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
              background: step === 'SUCCESS'
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3B71FE 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: step === 'SUCCESS'
                ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                : '0 4px 14px rgba(59, 113, 254, 0.3)',
            }}
          >
            {step === 'SUCCESS' ? (
              <CheckCircle2 size={24} color="#FFFFFF" strokeWidth={2.4} />
            ) : (
              <KeyRound size={24} color="#FFFFFF" strokeWidth={2.4} />
            )}
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
            {step === 'EMAIL_ENTRY' && 'Forgot Password?'}
            {step === 'OTP_AND_RESET' && 'Reset Password'}
            {step === 'SUCCESS' && 'Password Changed!'}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {step === 'EMAIL_ENTRY' &&
              "Enter your account's email address and we'll send you a 6-digit OTP code to reset your password."}
            {step === 'OTP_AND_RESET' && (
              <>
                We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below along with your new password.
              </>
            )}
            {step === 'SUCCESS' &&
              'Your password has been successfully updated. You can now log into your UniStay account.'}
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

        {/* STEP 1: Email Form */}
        {step === 'EMAIL_ENTRY' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Email Address</label>
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
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={15} />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification & New Password Form */}
        {step === 'OTP_AND_RESET' && (
          <form onSubmit={handleResetPassword}>
            {/* 6 Digit Input Boxes */}
            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                6-Digit Verification Code
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
                    id={`otp-input-${idx}`}
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

            {/* Resend Code Option */}
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
              <span style={{ color: 'var(--text-muted)' }}>Didn't receive the code?</span>
              {countdown > 0 ? (
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
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
                  Resend Code
                </button>
              )}
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
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
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
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
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Reset Password & Proceed'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setStep('EMAIL_ENTRY')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'SUCCESS' && (
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontWeight: 700, display: 'block' }}
            >
              Sign In to Your Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
