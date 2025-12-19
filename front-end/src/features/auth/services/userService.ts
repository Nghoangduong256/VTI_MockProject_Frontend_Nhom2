import api from "./axiosInstance";
import { User } from "../context/entity";

const USERS_ENDPOINT = "users";

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
};

export default userService;
