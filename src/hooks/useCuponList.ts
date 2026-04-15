import { useQuery } from "@tanstack/react-query";
import { getCoupon, getPlans } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchCouponList = async () => {
  const { access_token } = getUserData();
  const response: { data: any } = await getCoupon(access_token as string);
  return response?.data;
};

export const useCuponList = () => {
  return useQuery({
    queryKey: ["coupon", "list"],
    queryFn: () => fetchCouponList(),
    enabled: true,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
