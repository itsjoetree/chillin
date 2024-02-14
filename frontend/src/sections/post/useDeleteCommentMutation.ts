import { useToast } from "@/hooks/useToast";
import { clientApi, getHeaders } from "@/main";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Returns a function that deletes a comment.
 */
export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("post");
  const { toast } = useToast();

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const headers = await getHeaders();
    
      const resp = await clientApi.api.comment[commentId].delete({
        $headers: headers
      });
    
      if (resp.error) {
        throw new Error();
      }
    },
    onError: () => {  
      toast({
        title: t`deleteCommentFailureTitle`,
        description: t`deleteCommentFailure`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
    onSuccess: () => {
      toast({
        title: t`deletedCommentTitle`,
        description: t`deletedCommentDescription`,
      });
    }
  });

  return deleteCommentMutation;
}