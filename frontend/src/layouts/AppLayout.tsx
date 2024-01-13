import { Globe, Heart, PersonCircle } from "react-bootstrap-icons";
import { Logo } from "../components/Logo";
import { PropsWithChildren } from "react";

const AppLayout = ({ children }: PropsWithChildren) => (<div className="min-h-dvh flex flex-col sm:flex-row">
  <div className="desktop-sidebar bg-gray-800 min-h-dvh w-60 max-sm:hidden">
    <div className="sticky flex items-center justify-center top-5">
      <Logo />
    </div>
  </div>

  <div className="z-10 flex sticky top-0 bg-gray-800 items-center justify-between p-2 mobile-sidebar w-full sm:hidden">
    <Logo />

    <div className="flex gap-4">
      <Globe className="w-5 h-5" />
      <Heart className="w-5 h-5" />
      <PersonCircle className="w-5 h-5" />
    </div>
  </div>

  <div className="flex flex-col flex-1 bg-gray-900 min-w-0 overflow-y-clip">
    <main className="h-full flex-1 flex flex-col">
      {children}
    </main>
  </div>
</div>);

export default AppLayout;