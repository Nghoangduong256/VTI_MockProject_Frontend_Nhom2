import apiClient from './apiClient';

const contactService = {
    /**
     * Get frequent contacts
     * Endpoint: /api/contacts/frequent
     * @param {number} limit
     */
    getFrequentContacts: async (limit = 5) => {
        const response = await apiClient.get(`/api/contacts/frequent`, {
            params: { limit }
        });
        return response.data;
    }
};

export default contactService;
