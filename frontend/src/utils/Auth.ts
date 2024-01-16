import { useQuery } from "react-query";
import { supabase } from "../main";

/**
 * Returns the current user if logged in
 */
const useAuth = () => {
  const { data, isLoading } = useQuery("user", async () => await supabase.auth.getUser());
  return { data, isLoading }
}

export { useAuth }