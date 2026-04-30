import { useMutation } from "@tanstack/react-query";
import { updateGroupDetail } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const updateGroup = async (data) => {
    const { access_token } = getUserData();
    const response = await updateGroupDetail(data, access_token);
    return response?.data;
};

export const useUpdateGroup = () => {
    return useMutation({
        mutationFn: (data) => updateGroup(data),
        mutationKey: ["user", "followup"],
        retry: 0,
    });
};
