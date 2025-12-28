import api from "./axiosInstance";
import { User } from "../../context/entity";

const USERS_ENDPOINT = "profiles";

export const userService = {
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`${USERS_ENDPOINT}/${id}`);
    return response.data;
  },

  updateUser: async (id: number, user: Omit<User, "id">): Promise<User> => {
    const response = await api.put<User>(`${USERS_ENDPOINT}/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`${USERS_ENDPOINT}/${id}`);
  },

  updateAvatar: async (id: number, avatarBase64: string): Promise<void> => {
    await api.put(`${USERS_ENDPOINT}/${id}/avatar`, null, {
      params: { avatarUrl: avatarBase64 },
    });
  },
};

export default userService;
