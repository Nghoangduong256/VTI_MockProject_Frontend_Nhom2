import apiClient from "../apiClient";

const DEPOSIT_ENDPOINT = "/api/E-Wallet/deposits";

/**
 * Deposit Service - Handle E-Wallet deposit operations
 * Now using apiClient for proper JWT authentication
 */
export const DepositService = {
  /**
   * Deposit money to wallet
   * Endpoint: POST /api/E-Wallet/deposits
   * @param {object} data - { walletId, amount }
   */
  deposit(data) {
    return apiClient.post(DEPOSIT_ENDPOINT, data);
  },

  /**
   * Get wallet information by ID
   * Endpoint: GET /api/E-Wallet/deposits/wallet/{walletId}
   * @param {number} walletId
   */
  getWalletById(walletId) {
    return apiClient.get(`${DEPOSIT_ENDPOINT}/wallet/${walletId}`);
  },

  /**
   * Get recent deposit history
   * Endpoint: GET /api/E-Wallet/deposits/wallet/{walletId}/recent-deposits
   * @param {number} walletId
   */
  getRecentDeposits(walletId) {
    return apiClient.get(`${DEPOSIT_ENDPOINT}/wallet/${walletId}/recent-deposits`);
  },
};

export default DepositService;
