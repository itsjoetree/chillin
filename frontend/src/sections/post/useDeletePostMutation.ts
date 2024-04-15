import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import { clientApi, getHeaders } from "@/main";
import { useTranslation } from "react-i18next";

/**
 * Returns a function that deletes a post.
 */
export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("post");
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const resp = await clientApi.api.post[postId].delete({
        $headers: await getHeaders()
      });

      if (resp.error) {
        throw new Error();
      }
    },
    onError: () => {  
      toast({
        title: t`deleteFailureTitle`,
        description: t`deleteFailure`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
    onSuccess: () => {
      toast({
        title: t`deletedTitle`,
        description: t`deletedDescription`,
      });
    }
  });
}