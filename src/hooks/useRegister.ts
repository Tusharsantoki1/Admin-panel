import { useMutation } from "@tanstack/react-query";
import { userRegister } from "../utils/api";
import { Register } from "react-router-dom";

export const userAuthRegister = async (data: Register) => {
  const response: { data: any } = await userRegister(data);
  return response?.data;
};

export const useUserRegister = () => {
  return useMutation({
    mutationFn: (data: Register) => userAuthRegister(data),
    mutationKey: ["user", "register"],
    retry: 0,
  });
};
