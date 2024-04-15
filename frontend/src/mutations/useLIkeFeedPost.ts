import { clientApi, getHeaders } from "@/main";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { FeedResponse } from "server/controllers/feeds";

/**
 * Mutation to properly handle toggling a post like within an infinite feed.
 */
export const useLikeFeedPost = (queryKey: Array<unknown>) => {
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
    onMutate: async ({ postId, operation }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
  
      // Snapshot the previous value
      const prev = queryClient.getQueryData<InfiniteData<FeedResponse>>(queryKey);
      let updatedPrev = false;

      if (prev) {
        for (let i = 0; i < (prev.pages.length ?? 0) && !updatedPrev; i++) {
          for (let j = 0; j < prev.pages[i].items.length; j++) {
            if (prev.pages[i].items[j].id === postId) {
              const clonedPrev = structuredClone(prev);
              clonedPrev.pages[i].items[j].likedByViewer = operation === "like";
              clonedPrev.pages[i].items[j].likes = operation === "like" ? prev.pages[i].items[j].likes + 1 : prev.pages[i].items[j].likes - 1;
              queryClient.setQueryData<InfiniteData<FeedResponse>>(queryKey, clonedPrev);
              updatedPrev = true;
              return;
            }
          }
        }
      }

      // Return a context object with the snapshotted value
      return { prev }
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.prev)
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    }
  });
}