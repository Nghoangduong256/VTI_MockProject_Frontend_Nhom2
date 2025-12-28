import apiClient from './apiClient';

/**
 * Bank Account Service - Handle bank account related API calls
 */
const bankAccountService = {
    /**
     * Get bank accounts by user ID
     * Endpoint: GET /api/bank-account?userId={userId}
     * @param {number} userId - User ID
     * @returns {Promise} List of bank accounts
     */
    getBankAccountsByUserId: async (userId) => {
        const response = await apiClient.get('/api/bank-account', {
            params: { userId }
        });
        return response.data;
    }
};

export default bankAccountService;
