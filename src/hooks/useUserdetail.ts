import { useQuery } from "@tanstack/react-query";
import { getUserDetail } from "../utils/api";
import { getUserData } from "../utils/helpers";
import { UserDetailResponse } from "../type";

export const fetchUser = async (id: number): Promise<UserDetailResponse | any> => {
  const { access_token } = getUserData();
  const response: { data: any } = await getUserDetail(id, access_token as string);
  return response?.data;
};

export const useUserdetail = (id: number) => {
  return useQuery<UserDetailResponse | any>({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
    retry: 0,
    placeholderData: (previousData: any) => previousData,
  });
};

