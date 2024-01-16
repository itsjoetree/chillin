import { useTranslation } from "react-i18next";
import { z } from "zod";

/**
 * Hook that returns function to localize zod errors
 */
export const useLocalizeError = () => {
  const { t } = useTranslation("errors");

  const localizeError: z.ZodErrorMap = (issue) => {
    let message;
    const field = issue.path[0]?.toString();

    switch (issue.code) {
      case z.ZodIssueCode.too_small:
        message = t("minLength", { field: t(field), length: issue.minimum });
        break;
      case z.ZodIssueCode.too_big:
        message = t("maxLength", { field: t(field), length: issue.maximum });
        break;
      default:
        message = t("invalid", { field: t(field) });
        break;
    }

    return { message };
  }

  return { localizeError };
}