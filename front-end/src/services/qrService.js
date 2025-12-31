import apiClient from './apiClient';

const qrService = {
    /**
     * Get wallet QR code (Base64)
     * Endpoint: GET /api/qr/wallet
     */
    getWalletQR: async () => {
        const response = await apiClient.get('/api/qr/wallet');
        return response.data.qrBase64;
    },

    /**
     * Get wallet QR code with specific amount
     * Endpoint: POST /api/qr/wallet/with-amount
     * @param {number} amount - Amount to include in QR code
     */
    getWalletQRWithAmount: async (amount) => {
        const response = await apiClient.post('/api/qr/wallet/with-amount', { amount });
        return response.data.qrBase64;
    },

    /**
     * Download wallet QR code
     * Endpoint: GET /api/qr/wallet/download
     * Returns blob for file download
     */
    downloadWalletQR: async () => {
        const response = await apiClient.get('/api/qr/wallet/download', {
            responseType: 'blob'
        });
        return response.data;
    }
};

export default qrService;
