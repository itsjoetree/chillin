import AppLayout from "./layouts/AppLayout";
import ProfileView from "./sections/profile";

const App = () => {

  return (<AppLayout>
    <ProfileView />
    {/* <ProfileView /> */}
    {/* <OnboardingView /> */}
  </AppLayout>)
}

export default App;