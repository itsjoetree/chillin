import { AuthContext } from "@/utils/Auth";
import { useContext } from "react";

/**
 * Returns the current user if logged in
 */
export const useAuth = () => useContext(AuthContext);