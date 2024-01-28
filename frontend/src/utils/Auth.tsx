import { useQuery, useQueryClient } from "react-query";
import { clientApi, getHeaders, supabase } from "../main";
import { ReactNode, createContext, useCallback, useMemo } from "react";
import { Profile } from "server/schema/profile";
import { AuthToken } from "server/models/AuthToken";
import { type SignUpRequest } from "server/models/SignUpRequest";
import { type SignInRequest } from "server/models/SignInRequest";

export type AuthContextType = {
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

  const { data: profile, isLoading } = useQuery("auth-user", async (): Promise<Profile | undefined> => {
    const headers = await getHeaders();

    const profileResponse = await clientApi.api.profile.get({
      $headers: headers
    })

    if (profileResponse.error) return;

    return profileResponse.data;
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
    loading: isLoading
  }), [profile, isLoading, refreshProfile]);

  return (<AuthContext.Provider value={provider}>
    {children}
  </AuthContext.Provider>);
};