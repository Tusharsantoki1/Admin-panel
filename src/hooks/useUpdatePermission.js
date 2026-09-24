import { useMutation } from "@tanstack/react-query";
import { updatePermissionDetail } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const updatePermission = async (data) => {
    const { access_token } = getUserData();
    const response = await updatePermissionDetail(data, access_token);
    return response?.data;
};

export const useUpdatePermission = () => {
    return useMutation({
        mutationFn: (data) => updatePermission(data),
        mutationKey: ["user", "permission"],
        retry: 0,
    });
};
