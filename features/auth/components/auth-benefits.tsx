import { Icon } from "@/components/icon";

// What a free account gives, said once and in plain words, on both the sign-in and sign-up pages.
const BENEFITS = [
  "Save tutorials and projects to your account",
  "Download tutorial files, slides and notes",
  "Follow Padmore and see new work in your member dashboard",
  "Join the community conversation",
];

export function AuthBenefits() {
  return <ul className="auth-benefits">{BENEFITS.map((benefit) => <li key={benefit}><Icon name="check" size={16}/>{benefit}</li>)}</ul>;
}
