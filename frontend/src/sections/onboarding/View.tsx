import { createElement, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { EmojiHeartEyesFill, EmojiKissFill, EmojiSunglassesFill, EmojiWinkFill, Icon } from "react-bootstrap-icons";
import { twJoin } from "tailwind-merge";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Label } from "../../components/Label";
import { useToast } from "../../hooks/useToast";

type AppVariant = "chillin" | "cool" | "grounded" | "charismatic";
const appVariants: AppVariant[] = ["chillin", "cool", "grounded", "charismatic"] as const;

const variantMap: Record<AppVariant, { classList: string; selectedClassList: string; icon: Icon; description: string; }> = {
  chillin: {
    selectedClassList: "border-purple-200 text-gray-800 bg-purple-200",
    classList: "border-purple-200 text-purple-200",
    icon: EmojiHeartEyesFill,
    description: "You're chillin' like a villain"
  },
  charismatic: {
    selectedClassList: "border-pink-200 text-gray-800 bg-pink-200",
    classList: "border-pink-200 text-pink-200",
    icon: EmojiKissFill,
    description: "You're charismatic like cupid"
  },
  cool: {
    selectedClassList: "border-blue-200 text-gray-800 bg-blue-200",
    classList: "border-blue-200 text-blue-200",
    icon: EmojiSunglassesFill,
    description: "You're cool as a cucumber"
  },
  grounded: {
    selectedClassList: "border-green-200 text-gray-800 bg-green-200",
    classList: "border-green-200 text-green-200",
    icon: EmojiWinkFill,
    description: "You're grounded like a tree"
  }
}

type AppVariantCardProps = {
  variant: AppVariant;
  selected?: boolean;
  onSelect?: (variant: AppVariant) => void;
}

const AppVariantCard = ({ variant, selected, onSelect }: AppVariantCardProps) => {
  const selectedVariant = variantMap[variant];

  return (<button onClick={() => onSelect?.(variant)} className="block w-full md:w-fit">
    <Card className={twJoin("flex flex-col gap-4 items-center justify-center",
      selected ? selectedVariant.selectedClassList : selectedVariant.classList)}>
      <div className="flex flex-col items-center justify-center gap-2">
        {createElement(selectedVariant.icon, { className: "text-2xl" })}
        <h2 className="text-4xl">{variant}</h2>
      </div>

      <p>
        {selectedVariant.description}
      </p>
    </Card>
  </button>)
}

const VariantSelector = ({ selected, onSelect }: Pick<AppVariantCardProps, "onSelect"> & { selected?: AppVariant}) => {

  return (<div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">Choose your vibe</h1>
      <p>Select a theme/accent that will be applied as you navigate the app.</p>
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
  <h1 className="text-6xl text-center">Welcome to <span className={variantMap.chillin.classList}>chillin!</span></h1>
  <p className="text-center">A low key media site to connect with some some chill people developed by Joe Salinas</p>
</div>)

type SavedProgress = {
  selectedVariant: AppVariant;
  userInfo: { username: string; nickname: string; };
}

const InfoView = () => (<div className="flex flex-col gap-4">
  <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-bold">User information</h1>
    <p>To finish up your account, lets talk user info</p>
  </div>

  <div className="flex flex-col gap-3">
    <Label htmlFor="username">Username</Label>
    <Input id="username" placeholder="Username" />
  </div>

  <div className="flex flex-col gap-3">
    <Label htmlFor="nickname">Nickname</Label>
    <Input id="nickname" placeholder="Nickname" />
  </div>

  <div className="flex flex-col gap-3">
    <Label htmlFor="birthday">Birthday</Label>
    <Input style={{ colorScheme: "dark" }} type="date" id="birthday" placeholder="Birthday" />
  </div>
</div>)

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

  const onContinue = () => {
    if (lastStep === step) {
      toast({
        title: "Welcome to chillin!",
        description: "Your account has been created!",
      })
    } else {
      setStep(step + 1);

      if (step > 0)
        sessionStorage.setItem("onboarding-progress", JSON.stringify({ selectedVariant }));
    }
  }

  // Don't render while checking save data
  if (isLoading) return null;

  return (<div className="flex flex-col gap-8 px-2 w-full md:items-center md:justify-center py-5">
    {step === 0 && <WelcomeView />}
    {step === 1 && <VariantSelector selected={selectedVariant} onSelect={onSelectVariant}  />}
    {step === 2 && <InfoView />}

    <div className="flex gap-2 items-center justify-center w-full">
      {step > 1 && <Button onClick={() => setStep(step - 1)} variant="secondary">Back</Button>}
      <Button onClick={onContinue}>{step === 0 ? "Get Started" : "Continue"}</Button>
    </div>
  </div>)
}

export { View };