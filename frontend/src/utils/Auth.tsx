import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi, getHeaders, supabase } from "../main";
import { ReactNode, createContext, useCallback, useMemo } from "react";
import { Profile } from "server/schema/profile";
import { AuthToken } from "server/types";
import { type SignUpRequest } from "server/models/SignUpRequest";
import { type SignInRequest } from "server/models/SignInRequest";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

export type AuthContextType = {
  profile?: Profile | undefined | null;
  refreshProfile: () => void;
  signUp: (payload: SignUpRequest) => Promise<boolean>;
  signIn: (payload: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>(
/**
 * For now, set up skeleton function implementations since these will be
 * evaluated and replaced by working implementations in the AuthProvider.
 */
{
  refreshProfile: () => {},
  signIn: async () => {
    throw new Error("Unable to sign in");
  },
  signUp: async () => {
    throw new Error("Unable to sign up");
  },
  signOut: async () => {
    throw new Error("Unable to sign out");
  },
  loading: true,
});

/**
 * Provider to manage authentication state.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation("auth");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const headers = await getHeaders();

      const profileResponse = await clientApi.api.profile.get({
        $headers: headers
      })

      if (profileResponse.error) return null;

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
      const response = await clientApi.api.auth["sign-up"].post({
        $fetch: {
          body: JSON.stringify(payload)
        }
      });

      const errorMsg = response.error?.value;
      if (errorMsg) {
        const parsedError = JSON.parse(errorMsg);
        
        toast({
          title: "Sign Up",
          description: "message" in parsedError ? t(parsedError.message) : t`serverError`
        });
        return false;
      }

      const session = response.data;
      
      if (session) {
        await supabase.auth.setSession(session);
        await refreshProfile();
      }

      return true;
    },
    signOut: async () => {
      await supabase.auth.signOut();
      await refreshProfile();
    },
    loading: isLoading
  }), [profile, isLoading, refreshProfile, t, toast]);

  return (<AuthContext.Provider value={provider}>
    {children}
  </AuthContext.Provider>);
};