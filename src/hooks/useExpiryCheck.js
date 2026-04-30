import { useMutation } from "@tanstack/react-query";
import { checkExpiry, userFollowup, userTrialExtend } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const expiryCheck = async () => {
    const { access_token } = getUserData();
    const response = await checkExpiry(access_token);
    return response?.data;
};

export const useExpiryCheck = () => {
    return useMutation({
        mutationFn: () => expiryCheck(),
        mutationKey: ["user", "expiryCheck"],
        retry: 0,
    });
};
