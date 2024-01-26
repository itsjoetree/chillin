// import { useForm } from "react-hook-form";
// import { Button } from "./components/Button";
// import { useAuth } from "./hooks/useAuth";
// import { useTranslation } from "react-i18next";
// import { useLocalizeError } from "./utils/Form";
// import { SignInRequest, formSchema } from "server/models/SignInRequest";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Card } from "./components/Card";
// import { FormGroup } from "./components/FormGroup";
// import { Label } from "./components/Label";
// import { Input } from "./components/Input";
// import { useToast } from "./hooks/useToast";
import { Router, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const router = new Router({ routeTree })

// const SignIn = () => {
//   const { toast } = useToast();
//   const { localizeError } = useLocalizeError();
//   const { t } = useTranslation();
//   const { signIn } = useAuth();
//   const { handleSubmit, register, formState: { errors } } = useForm<SignInRequest>({ resolver: zodResolver(formSchema, { errorMap: localizeError}) });

//   const onSubmit = async (data: SignInRequest) => {
//     try {
//       await signIn(data);

//       toast({
//         title: "SIGNED IN",
//         description: "SUCCESS",
//       });
//     } catch {
//       toast({
//         title: "ERROR",
//         description: "ERROR SIGNING IN",
//       })
//     }
//   }

//   return (<Card>
//     <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//       <div className="flex flex-col gap-2">
//         <h1 className="text-3xl font-bold">{t`signIn`}</h1>
//       </div>

//       <FormGroup
//         label={<Label htmlFor="username">{t`email`}</Label>}
//         input={<Input id="username" {...register("email")} />}
//         error={errors.email?.message}
//       />

//       <FormGroup
//         label={<Label htmlFor="password">{t`password`}</Label>}
//         input={<Input type="password" {...register("password")} />}
//         error={errors.password?.message}
//       />

//       <Button type="submit">{t`signIn`}</Button>
//     </form>
//   </Card>);
// };

const App = () => {
  // const { profile, signOut, loading } = useAuth();

  return (<RouterProvider router={router} />)

  // return (<AppLayout>
  //   {profile && (<div className="text-xl font-bold self-center">
  //     <h1>Hi {profile.username}!</h1>
  //   </div>)}

  //   {loading ? null : <>
  //     {profile && <Button className="self-center" onClick={signOut}>Sign Out</Button>}
  //     {!profile && (<div className="max-w-2xl w-full self-center">
  //       <SignIn />
  //     </div>)}
  //   </>}

  //   {/* <ProfileView /> */}
  //   {/* <ProfileView /> */}
  // </AppLayout>)
}

export default App;