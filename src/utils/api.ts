import { callAPI } from "./axiosUtils";
import { Login, Register } from "../type";
import BASE_URL from "../api/config";

const userLogin = async (data: Login) => {
  const response = await callAPI("post", `${BASE_URL}/hedgex/auth/login`, data);
  return { data: response };
};

const userRegister = async (data: Register) => {
  const response = await callAPI("post", `${BASE_URL}/hedgex/auth/register`, data);
  return { data: response };
};

const getUser = async (access_token: string) => {
  const response = await callAPI("post", `${BASE_URL}/hedgex/admin/users`, {}, access_token);
  return { data: response };
};

const getPlans = async (access_token: string) => {
  const response = await callAPI("get", `${BASE_URL}/hedgex/admin/plans`, {}, access_token);
  return { data: response };
};


const userTrialExtend = async (data: { user_id: number, days: number, brokers: string }, access_token: string) => {
  const response = await callAPI("post", `${BASE_URL}/hedgex/admin/users/activate-trial`, data, access_token);
  return { data: response };
};

const getUsers = async (
  access_token: string,
  payload: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    sortOrder?: "asc" | "desc";
    sort?: "asc" | "desc";
  } = {},
) => {
  const normalizedSortOrder = payload.sortOrder || payload.sort || "desc";
  const response = await callAPI(
    "post",
    `${BASE_URL}/hedgex/admin/users`,
    {
      page: payload.page ?? 1,
      limit: payload.limit ?? 25,
      filters: payload.filters ?? {},
      sortOrder: normalizedSortOrder,
      sort: normalizedSortOrder,
    },
    access_token,
  );
  return { data: response };
};

export { userLogin, userRegister, getUser, getUsers, userTrialExtend, getPlans };
