import { apiClient } from './api-client';

export const analyticsApi = {
  getSummary: () => apiClient.get('/analytics/summary'),
  getDonationTrend: (period: string) => apiClient.get('/analytics/donation-trend', { params: { period } }),
  getTopCampaigns: (limit = 5) => apiClient.get('/analytics/top-campaigns', { params: { limit } }),
  getCategoryDistribution: () => apiClient.get('/analytics/category-distribution'),
  getPaymentStatus: () => apiClient.get('/analytics/payment-status'),
  getLatestTransactions: (limit = 10) => apiClient.get('/analytics/latest-transactions', { params: { limit } }),
};