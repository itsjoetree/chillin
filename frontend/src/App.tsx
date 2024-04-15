import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./hooks/useAuth";
import { ScreenLoading } from "./components/Loading";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  const auth = useAuth();

  if (auth.loading) {
    return <ScreenLoading />;
  }

  return (<RouterProvider router={router} context={{ auth }} />);
}

export default App;