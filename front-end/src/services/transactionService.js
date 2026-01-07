import apiClient from './apiClient';

const transactionService = {
    /**
     * Get transaction history
     * Endpoint: /api/transactions
     * @param {number} page
     * @param {number} size
     */
    getTransactions: async (page = 0, size = 10) => {
        const response = await apiClient.get('/api/transactions', {
            params: { page, size }
        });
        return response.data;
    },

    /**
     * Transfer money
     * Endpoint: /api/transactions/transfer
     * @param {object} data - { toUserId, amount, note }
     */
    transfer: async (data) => {
        const response = await apiClient.post('/api/transactions/transfer', data);
        return response.data;
    },

    /**
     * Create a transaction (Deposit/Topup)
     * Endpoint: /api/transactions
     * @param {object} data - { type, amount, sourceCardId }
     */
    deposit: async (data) => {
        const response = await apiClient.post('/api/transactions', data);
        return response.data;
    },

    /**
     * Get incoming transactions
     * Endpoint: GET /api/transactions/incoming?limit={limit}
     * @param {number} limit - Number of transactions to fetch
     */
    getIncomingTransactions: async (limit = 5) => {
        const response = await apiClient.get(`/api/transactions/incoming?limit=${limit}`);
        return response.data;
    },

    /**
     * Get spending analytics
     * Endpoint: GET /api/analytics/spending
     * @param {string} range - '7days', '30days', '90days'
     */
    getSpendingAnalytics: async (range = '7days') => {
        try {
            const response = await apiClient.get('/api/analytics/spending', { params: { range } });
            return response.data;
        } catch (error) {
            console.warn("API /api/analytics/spending not found, using dummy data");
            return [];
        }
    }
};

export default transactionService;

