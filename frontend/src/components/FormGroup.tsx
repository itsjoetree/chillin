import { ReactNode } from "react"

type FormGroupProps = {
  input: ReactNode;
  label: ReactNode;
  error?: string;
}

/**
 * Component to render an input, error, and label as a group.
 */
const FormGroup = ({ input, label, error }: FormGroupProps) => (<div className="flex flex-col gap-3">
  <div className="flex flex-col gap-3">
    {label}
    {input}
  </div>

  {error && <div className="text-sm text-purple-200">{error}</div>}
</div>);

export { FormGroup };