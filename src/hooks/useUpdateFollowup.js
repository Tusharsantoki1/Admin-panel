import { useMutation } from "@tanstack/react-query";
import { userFollowup, userTrialExtend } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const updateFollowup = async (data) => {
    const { access_token } = getUserData();
    const response = await userFollowup(data, access_token);
    return response?.data;
};

export const useUpdateFollowup = () => {
    return useMutation({
        mutationFn: (data) => updateFollowup(data),
        mutationKey: ["user", "followup"],
        retry: 0,
    });
};
