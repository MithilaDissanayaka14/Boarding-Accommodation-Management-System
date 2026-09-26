import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyStudentBookings: async () => {
    const response = await api.get('/bookings/my');
    return response.data;
  },

  getLandlordIncomingBookings: async () => {
    const response = await api.get('/bookings/incoming');
    return response.data;
  },

  updateBookingStatus: async (bookingId, statusData) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, statusData);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};
