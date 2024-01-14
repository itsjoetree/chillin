import { useEffect, useState } from "react";

const mobileScreenSize = 768;
const matchesQuery = () => window?.matchMedia(`(max-width: ${mobileScreenSize}px)`).matches;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(matchesQuery());

  useEffect(() => {
    window.addEventListener("resize", () => setIsMobile(matchesQuery()));
    return () => window.removeEventListener("resize", () => setIsMobile(matchesQuery()));
  }, []);

  return isMobile;
}

export { useIsMobile }