import { clientApi, getHeaders } from "@/main";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLikePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { postId: string; operation: "like" | "unlike" }) => {
      const headers = await getHeaders();

      const response = payload?.operation === "unlike" ? await clientApi.api.post[payload.postId].unlike.delete({
        $headers: headers
      })
        : await clientApi.api.post[payload.postId].like.post({
          $headers: headers
        });

      if (response.error) throw new Error();
    },
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["post"] })
  })
};