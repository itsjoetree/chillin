import { clientApi, getHeaders } from "@/main";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "server/schema/post";

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

/**
 * Hook to properly handle toggling a post like.
 */
export const useTogglePostLike = (queryKey: Array<unknown>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, operation }: { postId: number, operation: "like" | "unlike" }) => {
      if (operation === "like")
        await clientApi.api.post[postId].like.post({
          $headers: await getHeaders()
        });
      else
        await clientApi.api.post[postId].unlike.delete({
          $headers: await getHeaders()
        });
    },
    // When mutate is called:
    onMutate: async ({ operation }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
  
      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(queryKey);

      if (previousPost) {
        const clonedPrev = structuredClone(previousPost);
        clonedPrev.likedByViewer = operation === "like";
        clonedPrev.likes = operation === "like" ? previousPost.likes + 1 : previousPost.likes - 1;

        // Optimistically update to the new value
        queryClient.setQueryData<Post>(queryKey, clonedPrev);
      }
      
      // Return a context with the previous and new todo
      return { previousPost }
    },
    // If the mutation fails, use the context we returned above
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        queryKey,
        context?.previousPost,
      )
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  });
};