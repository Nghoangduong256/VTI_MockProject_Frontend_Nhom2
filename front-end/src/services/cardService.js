import apiClient from './apiClient';

const cardService = {
    /**
     * Get list of cards
     * Endpoint: /api/cards
     */
    getCards: async () => {
        const response = await apiClient.get('/api/cards');
        return response.data;
    },

    /**
     * Create a new card
     * Endpoint: /api/cards
     * @param {object} cardData
     */
    createCard: async (cardData) => {
        const response = await apiClient.post('/api/cards', cardData);
        return response.data;
    }
};

export default cardService;
