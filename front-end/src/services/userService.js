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
    },

    /**
     * Update user profile
     * Endpoint: PUT /api/user/profile
     * Body: { fullName, email, ... }
     */
    updateProfile: async (data) => {
        const response = await apiClient.put('/api/user/profile', data);
        return response.data;
    },

    /**
     * Update user avatar
     * Endpoint: PUT /api/user/profile/avatar
     * Body: { avatar } - Base64 string
     */
    updateAvatar: async (avatar) => {
        const response = await apiClient.put('/api/user/profile/avatar', { avatar });
        return response.data;
    }
};

export default userService;
