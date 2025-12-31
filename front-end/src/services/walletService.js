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
    }
};

export default walletService;

