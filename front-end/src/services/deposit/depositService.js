//
import api from "./asxiosionstance";
const DEPOSIT_ENDPOINT = "/deposits";
export const DepositService = {
  deposit(data) {
    return api.post(DEPOSIT_ENDPOINT, data);
  },
  getWalletById(walletId) {
    return api.get(`${DEPOSIT_ENDPOINT}/wallet/${walletId}`);
  },
  getRecentDeposits(walletId) {
    return api.get(`${DEPOSIT_ENDPOINT}/wallet/${walletId}/recent-deposits`);
  },
};

export default DepositService;
