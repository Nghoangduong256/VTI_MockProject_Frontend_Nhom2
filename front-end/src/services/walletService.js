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
    },

    /**
     * Get all wallets (Admin)
     * Endpoint: GET /api/admin/wallets
     * @param {number} page
     * @param {number} size
     */
    getAllWallets: async (page = 0, size = 50) => {
        const response = await apiClient.get('/api/admin/wallets', { params: { page, size } });
        return response.data;
    },

    /**
     * Lock wallet
     * Endpoint: PUT /api/admin/wallets/lock/{id}
     */
    lockWallet: async (id) => {
        const response = await apiClient.put(`/api/admin/wallets/lock/${id}`);
        return response.data;
    },

    /**
     * Unlock wallet
     * Endpoint: PUT /api/admin/wallets/unlock/{id}
     */
    unlockWallet: async (id) => {
        const response = await apiClient.put(`/api/admin/wallets/unlock/${id}`);
        return response.data;
    }
};

export default walletService;

