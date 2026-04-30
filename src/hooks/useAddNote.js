import { useMutation } from "@tanstack/react-query";
import { checkExpiry, userFollowup, userNote, userTrialExtend } from "../utils/api";
import { getUserData } from "../utils/helpers";

export const addNote = async (data) => {
    const { access_token } = getUserData();
    const response = await userNote(data, access_token);
    return response?.data;
};

export const useAddNote = () => {
    return useMutation({
        mutationFn: (data) => addNote(data),
        mutationKey: ["user", "addNote"],
        retry: 0,
    });
};
