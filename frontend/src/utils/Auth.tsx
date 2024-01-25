import { useQuery, useQueryClient } from "react-query";
import { supabase } from "../main";
import { ReactNode, createContext, useCallback, useMemo } from "react";
import { Profile } from "server/models/Profile";
import { AuthToken } from "server/src";
import { type SignUpRequest } from "server/models/SignUpRequest";
import { type SignInRequest } from "server/models/SignInRequest";

type AuthContextType = {
  profile?: Profile;
  refreshProfile: () => void;
  signUp: (payload: SignUpRequest) => Promise<void>;
  signIn: (payload: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  refreshProfile: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isRefetching } = useQuery("auth-user", async (): Promise<Profile | undefined> => {
    const { data, error } =  await supabase.auth.getSession();

    if (error || !data || !data.session) return;

    const profileResponse = await fetch("/api/profile", {
      headers: {
        "Authorization": `Bearer ${data.session?.access_token}`
      }
    })

    if (!profileResponse.ok) return;

    return await profileResponse.json();
  });

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries("auth-user")
  }, [queryClient]);

  const provider: AuthContextType = useMemo(() => ({
    profile,
    refreshProfile,
    signIn: async (payload: SignInRequest) => {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const session: AuthToken = await response.json();
        await supabase.auth.setSession(session);
      } else throw new Error("Error signing in");

      await refreshProfile();
    },
    signUp: async (payload: SignUpRequest) => {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const session: AuthToken = await response.json();
        await supabase.auth.setSession(session);
      } else throw new Error("Error signing up");

      await refreshProfile();
    },
    signOut: async () => {
      await supabase.auth.signOut();
      await refreshProfile();
    },
    loading: isLoading || isRefetching
  }), [profile, isLoading, isRefetching, refreshProfile]);

  return (<AuthContext.Provider value={provider}>
    {children}
  </AuthContext.Provider>);
};