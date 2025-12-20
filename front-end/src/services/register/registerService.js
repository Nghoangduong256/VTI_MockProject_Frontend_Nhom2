//
import api from "./asxiosionstance";
import { RegisterForm } from "../../types/typeRegister";
const REGISTER_ENDPOINT = "/register";
export const RegisterService = {
  register(data) {
    return api.post(REGISTER_ENDPOINT, data);
  },
};

export default RegisterService;
