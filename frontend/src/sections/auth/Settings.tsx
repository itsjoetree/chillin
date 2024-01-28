import { Card } from "@/components/Card";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/AlertDialog";

export const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("settings");
  const { signOut } = useAuth();

  const onLogout = async () => {
    await signOut();
    navigate({
      to: "/"
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold">{t`title`}</h2>
      <Link to="/settings/update-profile">
        <Button className="w-full">{t`updateProfile`}</Button>
      </Link>
      <Button disabled>{t`changePassword`}</Button>

      <AlertDialog>
        <AlertDialogTrigger title={t`delete`}>
          <Button className="w-full">{t`logout`}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t`logoutTitle`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`logoutConfirm`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t`cancel`}</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout}>{t`confirm`}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}