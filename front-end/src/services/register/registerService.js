import apiClient from "../apiClient";

const REGISTER_ENDPOINT = "/api/auth/register";

export const RegisterService = {
  register(data) {
    return apiClient.post(REGISTER_ENDPOINT, data);
  },
};

export default RegisterService;
