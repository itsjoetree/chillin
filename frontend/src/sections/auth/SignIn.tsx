import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormGroupContainer } from "@/components/FormGroupContainer";
import { FormGroup } from "@/components/FormGroup";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useLocalizeError } from "@/utils/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { formSchema, type SignInRequest } from "server/models/signInRequest";
import { Link } from "@tanstack/react-router";

export const SignIn = () => {
  const { toast } = useToast();
  const { localizeError } = useLocalizeError();
  const { t } = useTranslation("auth");
  const { signIn } = useAuth();
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<SignInRequest>(
    { resolver: zodResolver(formSchema, { errorMap: localizeError}) }
  );

  const onSubmit = async (data: SignInRequest) => {
    try {
      await signIn(data);
    } catch {

      toast({
        title: t`signIn`,
        description: t`signInError`,
      })
    }
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroupContainer
            title={t`signIn`}
            actionButtons={<Button disabled={isSubmitting} type="submit">{t`signIn`}</Button>}
          >
            <FormGroup
              label={<Label htmlFor="username">{t`email`}</Label>}
              input={<Input id="username" {...register("email")} />}
              error={errors.email?.message}
            />

            <FormGroup
              label={<Label htmlFor="password">{t`password`}</Label>}
              input={<Input type="password" {...register("password")} />}
              error={errors.password?.message}
            />
          </FormGroupContainer>
        </form>
      </Card>

      <div className="self-center">
        <Trans i18nKey="signInFooter" ns="auth">
          <Link disabled={isSubmitting} className="font-bold" to="/sign-up"></Link>
        </Trans>
      </div>
    </>
  );
};