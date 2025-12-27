import apiClient from './apiClient';

const walletService = {
    /**
     * Get wallet balance
     * Endpoint: /api/wallet/balance
     */
    getBalance: async () => {
        const response = await apiClient.get('/api/wallet/balance');
        return response.data;
    }
};

export default walletService;
