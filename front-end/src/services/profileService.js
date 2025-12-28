import apiClient from './apiClient';

/**
 * Profile Service - Handle user profile API calls
 */
const profileService = {
    /**
     * Get current user with full details including wallet
     * Endpoint: GET /api/me
     * @returns {Promise} User object with wallet information
     */
    getCurrentUser: async () => {
        const response = await apiClient.get('/api/me');
        return response.data;
    }
};

export default profileService;
