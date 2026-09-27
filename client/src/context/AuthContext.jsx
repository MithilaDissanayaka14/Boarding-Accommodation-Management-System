import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session by fetching current user from /auth/me (using httpOnly cookie)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await authService.getMe();
        if (data && data.data && data.data.user) {
          setUser(data.data.user);
        }
      } catch (err) {
        // Not authenticated or expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.data.user);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await authService.updateProfile(profileData);
    setUser(res.data.user);
    return res;
  };

  const uploadAvatar = async (formData) => {
    const res = await authService.uploadAvatar(formData);
    setUser(res.data.user);
    return res;
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getMe();
      if (data && data.data && data.data.user) {
        setUser(data.data.user);
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isStudent: user?.role === 'student',
        isLandlord: user?.role === 'landlord',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
