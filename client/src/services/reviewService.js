import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getListingReviews: async (listingId) => {
    const response = await api.get(`/reviews/listing/${listingId}`);
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/my');
    return response.data;
  },
};
