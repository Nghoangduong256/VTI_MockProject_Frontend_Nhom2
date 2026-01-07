import apiClient from './apiClient';

const walletService = {
    /**
     * Get wallet balance
     * Endpoint: /api/wallet/balance
     */
    getBalance: async () => {
        const response = await apiClient.get('/api/wallet/balance');
        return response.data;
    },

    /**
     * Get wallet information
     * Endpoint: GET /api/wallet/me
     * Returns walletId, accountName, accountNumber, currency
     */
    getWalletInfo: async () => {
        const response = await apiClient.get('/api/wallet/me');
        return response.data;
    },

    /**
     * Get wallet summary (Income/Expense)
     * Endpoint: GET /api/wallet/summary
     * @param {string} period - 'current' (default) or '2024-01'
     */
    getWalletSummary: async (period = 'current') => {
        // Fallback mock if API not ready yet, or use real endpoint
        // For now, prompt assumes API will exist.
        try {
            const response = await apiClient.get('/api/wallet/summary', { params: { period } });
            return response.data;
        } catch (error) {
            console.warn("API /api/wallet/summary not found, using dummy data");
            return { income: 0, expense: 0 };
        }
    }
};

export default walletService;

