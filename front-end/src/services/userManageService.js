import apiClient from "./apiClient";

const USERMANAGE_ENDPOINT = "/api/userManager";

const userManageService = {
  /**
   * Lấy toàn bộ user
   * @returns {Promise<Array>}
   */
  getAllUsers: async () => {
    try {
      const response = await apiClient.get(`${USERMANAGE_ENDPOINT}/all`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },
  lockUser(id) {
    return apiClient.put(`${USERMANAGE_ENDPOINT}/lock/${id}`);
  },

  unlockUser(id) {
    return apiClient.put(`${USERMANAGE_ENDPOINT}/unlock/${id}`);
  },
};

export default userManageService;
