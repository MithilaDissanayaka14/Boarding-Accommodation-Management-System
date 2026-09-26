import api from './api';

export const listingService = {
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  getMyListings: async () => {
    const response = await api.get('/listings/my/properties');
    return response.data;
  },

  createListing: async (formData) => {
    const response = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateListing: async (id, formData) => {
    const response = await api.patch(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};
