import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const fetchUsersList = async ({
  page = 1,
  limit = 25,
  filters = {},
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortOrder?: "asc" | "desc" | undefined;
} = {}) => {
  const { access_token } = getUserData();
  const response: { data: any } = await getUsers(access_token as string, {
    page,
    limit,
    filters,
    sortOrder,
  });
  return response?.data;
};

export const useUsersList = ({
  page = 1,
  limit = 25,
  filters = {},
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortOrder?: "asc" | "desc" | undefined;
} = {}) => {
  return useQuery({
    queryKey: ["user", "list", page, limit, filters, sortOrder],
    queryFn: () => fetchUsersList({ page, limit, filters, sortOrder }),
    enabled: true,
    retry: 0,
    placeholderData: (previousData) => previousData,
  });
};
