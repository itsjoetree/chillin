import { Post } from "./schema/post";
import { AuthSession } from "@supabase/supabase-js";
import { Comment } from "./schema/comment";

export type AuthToken = Pick<AuthSession, "access_token" | "refresh_token">;

export type CommentThread = Comment & {
  replies: CommentThread[] | null;
}

export type PostWithComments = Post & {
  comments?: CommentThread[];
}
