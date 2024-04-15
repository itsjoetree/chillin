import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { clientApi, getHeaders } from "@/main";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from '@tanstack/react-router'
import { PostEditor } from "@/components/PostEditor";
import { useLocalizeError } from "@/utils/Form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema } from "server/schema/post";

export const NewPost = ({ onClose }: { onClose: () => void; }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("post");
  const { toast } = useToast();
  const { localizeError } = useLocalizeError();
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<{ text: string }>(
    { resolver: zodResolver(postSchema, { errorMap: localizeError }) }
  );

  const onSubmit = async (data: { text: string }) => {
    const response = await clientApi.api.post.post({
      $headers: await getHeaders(),
      $fetch: {
        body: JSON.stringify(data)
      }
    });

    if (response.error) {
      toast({
        title: t`post`,
        description: t`postFailure`,
      });

      return;
    }

    toast({
      title: t`post`,
      description: t`postSuccess`,
    })

    navigate({
      to: "/"
    });

    queryClient.invalidateQueries({ queryKey: ["post"] });
  }

  return (<form onSubmit={handleSubmit(onSubmit)}>
    <Controller
      name="text"
      control={control}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <>
          {error && <div className="text-sm text-purple-200">{error?.message}</div>}
          <PostEditor
            onClose={onClose}
            username={profile?.username ?? ""}
            avatarUrl={profile?.avatarUrl ?? null}
            disableSubmit={isSubmitting}
            onInputUpdate={(text) => onChange(text)}
          />
        </>
      )}
    />
  </form>);
};