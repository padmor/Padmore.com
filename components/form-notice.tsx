import { Icon } from "@/components/icon";
export function FormNotice({ children }: { children: string }) {
  return <div className="form-notice" role="status"><Icon name="check-circle"/><span>{children}</span></div>;
}
