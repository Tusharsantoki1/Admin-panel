import { useMutation } from "@tanstack/react-query";
import { userLogin } from "../utils/api";
import { Login } from "../type";

export const fetchUserLogin = async (data: Login) => {
  const response: { data: any } = await userLogin(data);
  return response?.data;
};

export const useUserLogin = () => {
  return useMutation({
    mutationFn: (data: Login) => fetchUserLogin(data),
    mutationKey: ["user", "login"],
    retry: 0,
  });
};
