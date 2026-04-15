import { useQuery } from "@tanstack/react-query";
import { noop } from "../utils/helpers";

export const useTitleCount = () => {
  return useQuery({
    queryKey: ["title"],
    queryFn: () => noop(),
  });
};
