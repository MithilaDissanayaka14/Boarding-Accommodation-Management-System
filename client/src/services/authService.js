import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await api.patch('/auth/update-password', passwordData);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.patch('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  sendVerificationOtp: async (email) => {
    const response = await api.post('/auth/send-verification-otp', email ? { email } : {});
    return response.data;
  },

  verifyEmailOtp: async ({ otp, email }) => {
    const response = await api.post('/auth/verify-email-otp', { otp, email });
    return response.data;
  },

  forgotPasswordOtp: async (email) => {
    const response = await api.post('/auth/forgot-password-otp', { email });
    return response.data;
  },

  verifyResetOtp: async ({ email, otp }) => {
    const response = await api.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  resetPasswordOtp: async ({ email, otp, newPassword }) => {
    const response = await api.post('/auth/reset-password-otp', { email, otp, newPassword });
    return response.data;
  },
};
