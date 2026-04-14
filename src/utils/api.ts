import { Register } from "react-router-dom";
import { callAPI } from "./axiosUtils";
import { Login } from "../type";
import BASE_URL from "../api/config";

const userLogin = async (data: Login) => {
  const response = await callAPI("post", `${BASE_URL}/auth/login`, data);
  return { data: response };
};

const userRegister = async (data: Register) => {
  const response = await callAPI("post", `${BASE_URL}/auth/register`, data);
  return { data: response };
};

export { userLogin, userRegister };
