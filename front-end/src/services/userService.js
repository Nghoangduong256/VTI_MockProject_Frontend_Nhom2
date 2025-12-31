import apiClient from './apiClient';

const userService = {
    /**
     * Get current user profile
     * Endpoint: /api/user/profile
     */
    getProfile: async () => {
        const response = await apiClient.get('/api/user/profile');
        return response.data;
    },
    /**
     * Get current user and wallet info
     * Endpoint: /api/me
     */
    getCurrentUser: async () => {
        const response = await apiClient.get('/api/me');
        return response.data;
    }
};

export default userService;
