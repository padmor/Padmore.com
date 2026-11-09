"use client";
import { useFormStatus } from "react-dom";

// A submit button for forms that have no pending state of their own. While the form is being
// sent it shows a spinning circle and ignores further taps, so it can't be submitted twice.
export function SubmitButton({ children, disabled, ...props }: React.ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return <button {...props} type="submit" disabled={disabled || pending} aria-busy={pending}>{children}</button>;
}
