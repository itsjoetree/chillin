import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormGroup } from "@/components/FormGroup";
import { FormGroupContainer } from "@/components/FormGroupContainer";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { useAuth } from "@/hooks/useAuth";
import { useLocalizeError } from "@/utils/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { SignUpRequest, formSchema } from "server/models/SignUpRequest";

export const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { localizeError } = useLocalizeError();
  const { signUp } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpRequest>(
    { resolver: zodResolver(formSchema, { errorMap: localizeError }) }
  );

  const onSubmit = async (data: SignUpRequest) => {
    const success = await signUp({
      ...data
    });

    if (success) navigate({
      to: "/"
    });
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroupContainer
            title={t`signUp`}
            actionButtons={<Button disabled={isSubmitting} type="submit">{t`signUp`}</Button>}
          >
            <FormGroup
              label={<Label htmlFor="username">{t`username`}</Label>}
              input={<Input id="username" {...register("username")} />}
              error={errors.username?.message}
            />

            <FormGroup
              label={<Label htmlFor="nickname">{t`nickname`}</Label>}
              input={<Input id="nickname" {...register("nickname")} />}
              error={errors.nickname?.message}
            />

            <FormGroup
              label={<Label htmlFor="birthday">{t`birthday`}</Label>}
              input={<Input style={{ colorScheme: "dark" }} id="birthday" type="date" {...register("birthday")} />}
              error={errors.birthday?.message}
            />

            <FormGroup
              label={<Label htmlFor="email">{t`email`}</Label>}
              input={<Input id="email" {...register("email")} />}
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
        <Trans i18nKey="signUpFooter" ns="auth">
          <Link disabled={isSubmitting} className="font-bold" to="/"></Link>
        </Trans>
      </div>
    </>
  );
};