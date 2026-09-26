import api from './api';

export const invoiceService = {
  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  getStudentInvoices: async () => {
    const response = await api.get('/invoices/my');
    return response.data;
  },

  getLandlordInvoices: async () => {
    const response = await api.get('/invoices/landlord');
    return response.data;
  },

  submitPaymentSlip: async (invoiceId, formData) => {
    const response = await api.patch(`/invoices/${invoiceId}/slip`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  verifyPaymentSlip: async (invoiceId, verificationData) => {
    const response = await api.patch(`/invoices/${invoiceId}/verify`, verificationData);
    return response.data;
  },
};
