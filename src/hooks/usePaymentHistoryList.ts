import { useQuery } from "@tanstack/react-query";
import { getPaymentHistory } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchPaymentHistoryList = async () => {
  const { access_token } = getUserData();
  const response: { data: any } = await getPaymentHistory(access_token as string);
  return response?.data;
};

export const usePaymentHistoryList = () => {
  return useQuery({
    queryKey: ["paymenthistory", "list"],
    queryFn: () => fetchPaymentHistoryList(),
    enabled: true,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
