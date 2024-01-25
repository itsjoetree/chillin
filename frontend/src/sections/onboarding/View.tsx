import { ReactNode, createElement, useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { EmojiHeartEyesFill, EmojiKissFill, EmojiSunglassesFill, EmojiWinkFill, Icon } from "react-bootstrap-icons";
import { twJoin } from "tailwind-merge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useToast } from "@/hooks/useToast";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from '@hookform/resolvers/zod';
import { type SignUpRequest, formSchema } from "server/models/SignUpRequest";
import { useLocalizeError } from "@/utils/Form";
import { FormGroup } from "@/components/FormGroup";
import { Label } from "@/components/Label";
import { useAuth } from "@/hooks/useAuth";

type AppVariant = "chillin" | "cool" | "grounded" | "charismatic";
const appVariants: AppVariant[] = ["chillin", "cool", "grounded", "charismatic"] as const;

const variantMap: Record<AppVariant, { classList: string; selectedClassList: string; icon: Icon; description: ReactNode; }> = {
  chillin: {
    selectedClassList: "border-purple-200 text-gray-800 bg-purple-200",
    classList: "border-purple-200 text-purple-200",
    icon: EmojiHeartEyesFill,
    description: <Trans ns="onboarding" i18nKey="chillinDescription" />
  },
  charismatic: {
    selectedClassList: "border-pink-200 text-gray-800 bg-pink-200",
    classList: "border-pink-200 text-pink-200",
    icon: EmojiKissFill,
    description: <Trans ns="onboarding" i18nKey="charismaticDescription" />
  },
  cool: {
    selectedClassList: "border-blue-200 text-gray-800 bg-blue-200",
    classList: "border-blue-200 text-blue-200",
    icon: EmojiSunglassesFill,
    description: <Trans ns="onboarding" i18nKey="coolDescription" />
  },
  grounded: {
    selectedClassList: "border-green-200 text-gray-800 bg-green-200",
    classList: "border-green-200 text-green-200",
    icon: EmojiWinkFill,
    description: <Trans ns="onboarding" i18nKey="groundedDescription" />
  }
}

type AppVariantCardProps = {
  variant: AppVariant;
  selected?: boolean;
  onSelect?: (variant: AppVariant) => void;
}

const AppVariantCard = ({ variant, selected, onSelect }: AppVariantCardProps) => {
  const { t } = useTranslation("onboarding");
  const selectedVariant = variantMap[variant];

  return (<button type="button" onClick={() => onSelect?.(variant)} className="block w-full md:w-fit">
    <Card className={twJoin("flex flex-col gap-4 items-center justify-center",
      selected ? selectedVariant.selectedClassList : selectedVariant.classList)}>
      <div className="flex flex-col items-center justify-center gap-2">
        {createElement(selectedVariant.icon, { className: "text-2xl" })}
        <h2 className="text-4xl">{t(variant)}</h2>
      </div>

      <p>
        {selectedVariant.description}
      </p>
    </Card>
  </button>)
}

const VariantSelector = ({ selected, onSelect }: Pick<AppVariantCardProps, "onSelect"> & { selected?: AppVariant}) => {
  const { t } = useTranslation("onboarding");

  return (<div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">{t`varaintSelectTitle`}</h1>
      <p>{t`variantSelectDescription`}</p>
    </div>

    <div className="flex gap-4 flex-wrap md:items-center md: justify-center">
      {
        appVariants.map((variant) => (<AppVariantCard
          key={variant}
          variant={variant}
          selected={variant === selected}
          onSelect={onSelect}
        />))
      }
    </div>
  </div>)};

const WelcomeView = () => (<div className="flex flex-col items-center justify-center gap-4">
  {
    createElement(variantMap.chillin.icon, { className: twJoin("text-6xl", variantMap.chillin.classList)})
  }
  <h1 className="text-6xl text-center">
    <Trans ns="onboarding" i18nKey="welcomeTitle">
      <span className={variantMap.chillin.classList}></span>
    </Trans>
  </h1>
  <p className="text-center">
    <Trans ns="onboarding" i18nKey="welcomeDescription" />
  </p>
</div>)

type SavedProgress = {
  selectedVariant: AppVariant;
  userInfo: { username: string; nickname: string; };
}

const InfoView = () => {
  const { t } = useTranslation("onboarding");
  const { register, formState: { errors } } = useFormContext<SignUpRequest>();

  return (<div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">{t`userInfoTitle`}</h1>
      <p>{t`userInfoDescription`}</p>
    </div>

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
  </div>);
}

/**
 * Obtains saved progress from sessionStorage for the current view
 */
const useSavedProgress = () => {
  const [savedProgress, setSavedProgress] = useState<SavedProgress>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const save = sessionStorage.getItem("onboarding-progress");
    if (save) {
      setSavedProgress(JSON.parse(save));
    }
    setIsLoading(false);
  }, [])

  return { savedProgress, isLoading };
}

const lastStep = 2;

const View = () => {
  const { profile, loading, signUp } = useAuth();
  const { localizeError } = useLocalizeError();
  const { t } = useTranslation("onboarding");

  const methods = useForm<SignUpRequest>({ resolver: zodResolver(formSchema, { errorMap: localizeError }) });
  const { toast } = useToast();
  const { savedProgress, isLoading } = useSavedProgress();
  const [step, setStep] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<AppVariant>();

  // Load save data
  useEffect(() => {
    if (savedProgress) {
      setStep(savedProgress.selectedVariant ? 2 : 0);
      setSelectedVariant(savedProgress.selectedVariant)
    }
  }, [savedProgress]);

  const onSelectVariant = (variant: AppVariant) => {
    setSelectedVariant(variant);
  }

  const onSubmit = async (data: SignUpRequest) => {
    try {
      await signUp({
        ...data,
        siteVariant: selectedVariant!
      });

      toast({
        title: "Account created",
        description: "Your account has been created. Redirecting to home page.",
      });
    } catch {
      toast({
        title: "Error",
        description: "There was an error creating your account. Please try again.",
      })
    }
  }

  const onContinue = async () => {
    if (lastStep === step)
      return;

    setStep(step + 1);

    if (step > 0)
      sessionStorage.setItem("onboarding-progress", JSON.stringify({ selectedVariant }));
  }

  // Don't render while loading state
  if (profile)
    console.log(profile);

  if (isLoading || loading || profile) return null;

  return (<div className="flex flex-col gap-8 px-2 w-full md:items-center md:justify-center py-5">
    <Card className="w-full max-w-3xl">
      <FormProvider {...methods}>
        <form className="flex flex-col gap-4" onSubmit={methods.handleSubmit(onSubmit)}>
          {step === 0 && <WelcomeView />}
          {step === 1 && <VariantSelector selected={selectedVariant} onSelect={onSelectVariant}  />}
          {step === 2 && <InfoView />}

          <div className="flex gap-2 items-center justify-center w-full">
            {step > 1 && <Button type="button" onClick={() => setStep(step - 1)} variant="secondary">{t`back`}</Button>}
            <Button
              onClick={step < lastStep ? onContinue : undefined}
              type={step === lastStep ? "submit" : "button"}
            >{step === 0 ? t`getStarted` : t`continue`}</Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  </div>)
}

export { View };