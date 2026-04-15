import { useQuery } from "@tanstack/react-query";
import { getPlans } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchPlansList = async () => {
  const { access_token } = getUserData();
  const response: { data: any } = await getPlans(access_token as string);
  return response?.data;
};

export const usePlansList = () => {
  return useQuery({
    queryKey: ["plans", "list"],
    queryFn: () => fetchPlansList(),
    enabled: true,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
