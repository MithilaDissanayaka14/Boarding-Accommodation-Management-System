import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  ShieldCheck,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Calendar,
  MapPin,
  UploadCloud,
  Trash2,
  ImageIcon,
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

export const Profile = () => {
  const { user, updateProfile, uploadAvatar, isStudent, isLandlord, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'picture' | 'security'

  // Profile Details Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Picture Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Status feedback
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Synchronize state when user object loads/changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setUniversity(user.university || (isStudent ? 'SLIIT' : ''));
      setBio(user.bio || '');
      setAddress(user.address || '');
      setEmergencyContact(user.emergencyContact || '');
    }
  }, [user, isStudent]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to access your profile settings.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Sign In
        </Link>
      </div>
    );
  }

  // Handle Photo File Selection from Device
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setProfileError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size must be smaller than 5MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfileError('');
    setActiveTab('picture');
  };

  // Upload Selected Picture to Backend
  const handleUploadPicture = async () => {
    if (!selectedFile) {
      setProfileError('Please select a picture to upload.');
      return;
    }

    setUploadingPicture(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      await uploadAvatar(formData);
      setProfileSuccess('Profile picture uploaded and updated successfully!');
      setSelectedFile(null);
      setPreviewUrl('');
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) {
      setProfileError(
        err.response?.data?.message || err.message || 'Failed to upload profile picture. Please try again.'
      );
    } finally {
      setUploadingPicture(false);
    }
  };

  // Remove Picture (Reset back to Initials)
  const handleRemovePicture = async () => {
    setProfileError('');
    setProfileSuccess('');
    setUploadingPicture(true);

    try {
      await updateProfile({ avatar: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      setProfileSuccess('Profile picture removed. Using initials avatar.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError('Failed to remove profile picture.');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Handle Profile Details Update Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        university: university.trim(),
        bio: bio.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
      };

      await updateProfile(payload);
      setProfileSuccess('Your profile details have been successfully updated!');
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) {
      setProfileError(
        err.response?.data?.message || err.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await authService.updatePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password changed successfully! Keep your new password secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password. Please verify your current password.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const memberSinceYear = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '2026';

  const currentDisplayPhoto = previewUrl || user.avatar;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1180px' }}>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* 
        ========================================================================
        PROFILE HERO CARD WITH GRADIENT BACKDROP & QUICK UPLOAD BUTTON
        ========================================================================
      */}
      <div
        className="card"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '2rem',
          border: '1px solid #E6E8EC',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Cover Gradient Banner */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #1E293B 0%, #2563EB 50%, #3B71FE 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: '20px',
              top: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {user.role} Account
            </span>
          </div>
        </div>

        {/* Profile Info Header Content */}
        <div
          style={{
            padding: '0 2rem 1.75rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            position: 'relative',
            marginTop: '-50px',
          }}
        >
          {/* Avatar and Name */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              {currentDisplayPhoto ? (
                <img
                  src={currentDisplayPhoto}
                  alt={user.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B71FE 0%, #2563EB 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 8px 20px rgba(59, 113, 254, 0.3)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera Trigger Button on Avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Upload Photo from Device"
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Camera size={15} />
              </button>
            </div>

            <div style={{ paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.025em',
                    margin: 0,
                  }}
                >
                  {user.name}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    backgroundColor: isStudent ? '#EEF4FF' : '#E8F7EE',
                    color: isStudent ? '#2563EB' : '#059669',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <ShieldCheck size={14} />
                  {isStudent ? 'Verified Student' : isLandlord ? 'Verified Property Owner' : 'Administrator'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  marginTop: '0.4rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--primary)" />
                  <span>{user.email}</span>
                </div>
                {user.university && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <GraduationCap size={15} color="var(--primary)" />
                    <span>{user.university} Campus</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Member since {memberSinceYear}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Upload Picture button + Portal link) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                backgroundColor: '#3B71FE',
                borderRadius: '12px',
              }}
            >
              <Camera size={15} />
              Upload Picture
            </button>

            {isStudent && (
              <Link
                to="/student/dashboard"
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                }}
              >
                <GraduationCap size={16} color="var(--primary)" />
                Student Portal
              </Link>
            )}
            {isLandlord && (
              <Link
                to="/landlord/dashboard"
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                }}
              >
                <Building2 size={16} color="var(--primary)" />
                Landlord Hub
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        TWO COLUMN SETTINGS LAYOUT (Tabs & Form + Sidebar Overview)
        ========================================================================
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 340px)',
          gap: '2rem',
          alignItems: 'start',
        }}
        className="profile-layout"
      >
        {/* Left Column: Tabbed Forms */}
        <div>
          {/* Segmented Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#F1F5F9',
              padding: '0.35rem',
              borderRadius: '16px',
              marginBottom: '1.75rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'details' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'details' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'details' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={16} />
              Personal Info
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('picture')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'picture' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'picture' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'picture' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <ImageIcon size={16} />
              Profile Picture
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'security' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === 'security' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Key size={16} />
              Password & Security
            </button>
          </div>

          {/* Feedback Messages */}
          {profileSuccess && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#15803D',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                padding: '0.875rem 1.25rem',
                borderRadius: '14px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#B91C1C',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                padding: '0.875rem 1.25rem',
                borderRadius: '14px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={18} />
              <span>{profileError}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL DETAILS FORM */}
          {activeTab === 'details' && (
            <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Personal Information
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Manage your personal identity, contact details, and campus affiliation.
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Full Name & Phone Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      required
                    />
                  </div>
                </div>

                {/* Email (Read only) & Role Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Registered Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        className="form-input"
                        value={user.email}
                        disabled
                        style={{ backgroundColor: '#F8FAFC', color: 'var(--text-muted)', cursor: 'not-allowed', paddingRight: '2.5rem' }}
                      />
                      <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Email is permanently linked to your UniStay credentials
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Affiliation / Campus
                    </label>
                    {isStudent ? (
                      <select
                        className="form-select"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                      >
                        <option value="">Select University</option>
                        {UNIVERSITIES.map((u) => (
                          <option key={u} value={u}>
                            {u} Campus
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Malabe Hostels Management"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* Emergency Contact & Residential Address */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      {isStudent ? 'Emergency Guardian Contact' : 'Office Hotline / Secondary Contact'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isStudent ? 'e.g. Father: +94 71 987 6543' : 'e.g. +94 11 234 5678'}
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Residential / Permanent Address
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. No. 24, Temple Road, Colombo"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio / Description */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Bio / About Yourself
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {bio.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder={
                      isStudent
                        ? 'Tell prospective roommates or landlords about your degree program, study habits, hobbies, and clean living style...'
                        : 'Introduce your properties, hospitality background, security focus, and house rules overview...'
                    }
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Save Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={profileSaving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      backgroundColor: '#3B71FE',
                      minWidth: '180px',
                    }}
                  >
                    <Save size={18} />
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PROFILE PICTURE UPLOAD */}
          {activeTab === 'picture' && (
            <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Upload Profile Picture
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Upload a photo directly from your phone, laptop, or camera to personalize your account.
                </p>
              </div>

              {/* Current Preview Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.75rem',
                }}
              >
                {currentDisplayPhoto ? (
                  <img
                    src={currentDisplayPhoto}
                    alt="Active Profile Picture"
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)',
                      boxShadow: '0 4px 14px rgba(59, 113, 254, 0.25)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 800,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {previewUrl ? 'Selected New Picture (Ready to Save)' : user.avatar ? 'Current Profile Picture' : 'Default Initials Picture'}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                    {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : user.avatar ? 'Active photo is displayed across UniStay' : 'No photo uploaded yet'}
                  </p>
                </div>
              </div>

              {/* Drag-and-Drop / Upload Trigger Box */}
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#FAFAFA',
                  transition: 'all 0.15s ease',
                  marginBottom: '1.75rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EEF4FF',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <UploadCloud size={28} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Click to Choose or Drag & Drop Photo Here
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Supports JPEG, PNG, or WebP files up to 5MB.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                {user.avatar ? (
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    disabled={uploadingPicture}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: 'var(--status-danger-text)',
                      borderColor: 'var(--status-danger-border)',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={16} />
                    Remove Picture
                  </button>
                ) : (
                  <div />
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="btn btn-secondary"
                    style={{ fontWeight: 600 }}
                  >
                    Browse Files...
                  </button>

                  <button
                    type="button"
                    onClick={handleUploadPicture}
                    disabled={!selectedFile || uploadingPicture}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#3B71FE',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      minWidth: '160px',
                    }}
                  >
                    <Save size={16} />
                    {uploadingPicture ? 'Uploading...' : 'Upload & Save Picture'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PASSWORD & SECURITY FORM */}
          {activeTab === 'security' && (
            <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Password & Security Settings
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Keep your account secure with a strong password.
                </p>
              </div>

              {passwordSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: '#15803D',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '14px',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: '#B91C1C',
                    backgroundColor: 'var(--status-danger-bg)',
                    border: '1px solid var(--status-danger-border)',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '14px',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Current Password */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Current Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        minLength={6}
                        required
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
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
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Security tips */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  🔒 <strong>Security Tip:</strong> Choose a strong, unique password with a mixture of letters, numbers, and symbols. We never share your credentials with anyone.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={passwordSaving}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 700,
                      backgroundColor: '#3B71FE',
                      minWidth: '180px',
                    }}
                  >
                    <Lock size={16} />
                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Sidebar: Account Summary & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Status Card */}
          <div className="card" style={{ padding: '1.75rem', borderRadius: '20px', border: '1px solid #E6E8EC' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Account Verification
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle2 size={14} /> Active
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account Type</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Identity Badge</span>
                <span style={{ fontWeight: 700, color: '#2563EB' }}>Verified</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Joined</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{memberSinceYear}</span>
              </div>
            </div>
          </div>

          {/* Quick Support / Contact Card */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              borderRadius: '20px',
              border: '1px solid #E6E8EC',
              backgroundColor: '#F8FAFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                UniStay Community
              </h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1rem' }}>
              Need assistance updating university credentials or changing your registered email? Contact UniStay support.
            </p>
            <a
              href="mailto:support@unistay.lk"
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              support@unistay.lk <ArrowRight size={14} />
            </a>
          </div>

          {/* Sign Out Shortcut */}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              borderRadius: '14px',
              fontWeight: 600,
              color: 'var(--status-danger-text)',
              borderColor: 'var(--status-danger-border)',
            }}
          >
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
};
