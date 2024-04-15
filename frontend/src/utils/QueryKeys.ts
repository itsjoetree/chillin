export const getPostQueryKey = (postId: string) => ["post", postId];
export const getPostFeedQueryKey = ["post", "feed"];
export const getPostOnProfileQueryKey = (username: string) => ["post", "profile", username];

