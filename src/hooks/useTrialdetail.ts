import { useQuery } from "@tanstack/react-query";
import { getTrialDetail, getUserDetail } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchTrial = async (id: number) => {
  const { access_token } = getUserData();
  const response: { data: any } = await getTrialDetail(id, access_token as string);
  return response?.data;
};

export const useTrialdetail = (id: number) => {
  return useQuery({
    queryKey: ["user", "trial", id],
    queryFn: () => fetchTrial(id),
    enabled: !!id,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
