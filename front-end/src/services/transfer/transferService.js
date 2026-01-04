import apiClient from "../apiClient";

const BASE_URL = "/E-Wallet/transfers";

const TransferService = {
  /**
   * Gửi tiền
   * @param {object} data
   *  - fromWalletId
   *  - toWalletId
   *  - amount
   *  - note
   */
  transfer(data) {
    return apiClient.post(BASE_URL, data);
  },

  /**
   * Lấy thông tin ví theo ID
   * @param {number} walletId
   */
  getWalletById(walletId) {
    return apiClient.get(`${BASE_URL}/wallet/${walletId}`);
  },

  /**
   * Lấy lịch sử giao dịch
   * @param {number} walletId
   * @param {object} params
   *  - page {number}
   *  - size {number}
   *  - direction {"IN" | "OUT"}
   *  - fromDate {string ISO}
   *  - toDate {string ISO}
   */
  getTransferHistory(walletId, params = {}) {
    return apiClient.get(
      `${BASE_URL}/wallet/${walletId}/history`,
      { params }
    );
  },

  /**
   * Lấy chi tiết giao dịch
   * @param {number} transferId
   */
  getTransferDetail(transferId) {
    return apiClient.get(`${BASE_URL}/${transferId}`);
  },
};

export default TransferService;
