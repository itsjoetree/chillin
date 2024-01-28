import { ReactNode } from "@tanstack/react-router";

type FormGroupContainerProps = {
  title: string;
  subTitle?: string;
  children: ReactNode;
  actionButtons: ReactNode;
}

/**
 * Used to render a card with a title and children.
 */
export const FormGroupContainer = ({ title, subTitle, children, actionButtons }: FormGroupContainerProps) => {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">{title}</h2>
        {subTitle && <p>{subTitle}</p>}
      </div>

      <div className="flex flex-col gap-5">
        {children}
      </div>
      {actionButtons}
    </div>
  );
}