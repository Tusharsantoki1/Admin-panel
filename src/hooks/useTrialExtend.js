import { useMutation } from "@tanstack/react-query";
import { userTrialExtend } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchTrialExtend = async (data) => {
  const { access_token } = getUserData();
  const response = await userTrialExtend(data, access_token);
  return response?.data;
};

export const useTrialExtend = () => {
  return useMutation({
    mutationFn: (data) => fetchTrialExtend(data),
    mutationKey: ["user", "TrialExtend"],
    retry: 0,
  });
};
