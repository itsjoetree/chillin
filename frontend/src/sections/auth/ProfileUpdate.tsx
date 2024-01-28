import { Card } from "@/components/Card";
import { FormGroupContainer } from "@/components/FormGroupContainer";
import { FormGroup } from "@/components/FormGroup";
import { Label } from "@/components/Label";
import { Input } from "@/components/Input";
import { useForm } from "react-hook-form";
import { useLocalizeError } from "@/utils/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { ProfileRequestBody, profileSchema } from "server/schema/profile";
import { clientApi, getHeaders } from "@/main";
import { useQueryClient } from "react-query";

export const ProfileUpdate = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { localizeError } = useLocalizeError();
  const { t } = useTranslation("settings");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileRequestBody>(
    {
      resolver: zodResolver(profileSchema, { errorMap: localizeError }),
      defaultValues: {
        username: profile?.username,
        nickname: profile?.nickname,
        birthday: profile?.birthday ? profile.birthday.split("T")[0] : undefined,
      }
    }
  );

  const onSubmit = async (data: ProfileRequestBody) => {
    try {
      const headers = await getHeaders();

      const result = await clientApi.api.profile.put({
        $headers: headers,
        $fetch: {
          body: JSON.stringify(data)
        }
      });

      if (result.error)
        throw new Error();

      await queryClient.invalidateQueries("auth-user");
      await queryClient.invalidateQueries(["profile", profile?.username])

      reset(data);

      toast({
        title: t`profile`,
        description: t`profileUpdateSuccess`,
      })
    } catch {
      toast({
        title: t`profile`,
        description: t`profileUpdateError`,
      })
    }
  }

  return (<Card>
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormGroupContainer
        title={t`profile`}
        actionButtons={<Button disabled={isSubmitting || !isDirty} type="submit">{t`saveChanges`}</Button>}
      >
        <FormGroup
          label={<Label htmlFor="username">{t`username`}</Label>}
          input={<Input disabled id="username" {...register("username")} />}
          error={errors.username?.message}
        />

        <FormGroup
          label={<Label htmlFor="nickname">{t`nickname`}</Label>}
          input={<Input id="nickname" {...register("nickname")} />}
          error={errors.nickname?.message}
        />

        <FormGroup
          label={<Label htmlFor="birthday">{t`birthday`}</Label>}
          input={<Input disabled style={{ colorScheme: "dark" }} id="birthday" type="date" {...register("birthday")} />}
          error={errors.birthday?.message}
        />
      </FormGroupContainer>
    </form>
  </Card>);
}
