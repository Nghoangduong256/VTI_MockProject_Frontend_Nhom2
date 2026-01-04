import api from "./axiosInstance";
import { UserProfile } from "../../context/entity";

const USER_PROFILE_ENDPOINT = "/user/profile";

export const userService = {
  /** Lấy profile user đang đăng nhập (JWT) */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(USER_PROFILE_ENDPOINT);
    return response.data;
  },

  /** Update thông tin profile (không bao gồm avatar) */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(USER_PROFILE_ENDPOINT, data);
    return response.data;
  },

  /** Update avatar (Base64) */
  updateAvatar: async (avatarBase64: string): Promise<void> => {
    await api.put(`${USER_PROFILE_ENDPOINT}/avatar`, {
      avatar: avatarBase64,
    });
  },
};

export default userService;
