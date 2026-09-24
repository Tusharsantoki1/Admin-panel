import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchPermissions = async () => {
  const { access_token } = getUserData();
  const response: { data: any } = await getPermissions(access_token as string);
  return response?.data;
};

export const usePermissionList = () => {
  return useQuery({
    queryKey: ["admin", "permissions"],
    queryFn: () => fetchPermissions(),
    enabled: true,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
