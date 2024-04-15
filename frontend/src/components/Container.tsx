import { ReactNode } from "react";

export const Container = ({ children }: { children: ReactNode; }) => (
  <div className="mx-auto self-center w-full max-w-xl py-5 px-2">
    {children}
  </div>
);