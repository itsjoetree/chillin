import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi, getHeaders, supabase } from "../main";
import { ReactNode, createContext, useCallback, useMemo } from "react";
import { Profile } from "server/schema/profile";
import { AuthToken } from "server/types";
import { type SignUpRequest } from "server/models/signUpRequest";
import { type SignInRequest } from "server/models/signInRequest";

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

  const { data: profile, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const headers = await getHeaders();

      const profileResponse = await clientApi.api.profile.get({
        $headers: headers
      })

      if (profileResponse.error) return;

      return profileResponse.data;
    }
  });

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-user"] })
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