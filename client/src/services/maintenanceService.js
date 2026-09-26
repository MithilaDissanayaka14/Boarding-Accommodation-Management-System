import api from './api';

export const maintenanceService = {
  createRequest: async (ticketData) => {
    const response = await api.post('/maintenance', ticketData);
    return response.data;
  },

  getStudentRequests: async () => {
    const response = await api.get('/maintenance/my');
    return response.data;
  },

  getLandlordRequests: async () => {
    const response = await api.get('/maintenance/landlord');
    return response.data;
  },

  updateRequestStatus: async (ticketId, updateData) => {
    const response = await api.patch(`/maintenance/${ticketId}/status`, updateData);
    return response.data;
  },
};
