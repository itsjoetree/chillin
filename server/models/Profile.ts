export type Profile = {
  id: number;
  userId: string | null;
  avatarUrl: string | null;
  username: string | null;
  nickname: string | null;
  birthday: string | null;
  updatedAt: string | null;
  siteVariant: "chillin" | "charismatic" | "grounded" | "cool";
};