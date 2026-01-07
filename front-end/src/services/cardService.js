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
    },

    /**
     * Deposit money from card to wallet
     * Endpoint: /api/cards/deposit
     * @param {object} data - { cardId, amount, description }
     */
    depositFromCard: async (data) => {
        const response = await apiClient.post('/api/cards/deposit', data);
        return response.data;
    },

    /**
     * Get deposit history from cards
     * Endpoint: /api/cards/deposit/history
     */
    getDepositHistory: async () => {
        const response = await apiClient.get('/api/cards/deposit/history');
        return response.data;
    }
};

export default cardService;
