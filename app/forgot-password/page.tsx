import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/password-forms";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
export const metadata = { title: "Reset your password" };
export default function ForgotPasswordPage() { return <section className="page-container auth-page"><div className="auth-aside"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Let&apos;s get you back in.</h1><p>Enter your email and we&apos;ll send a link to choose a new password.</p><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>Reset your password</h2><p>The link expires, so use it soon after it arrives.</p><ForgotPasswordForm/><div className="auth-links"><span>Remembered it? <Link href="/signin">Sign in</Link></span><Link href="/">Back to home</Link></div></div></section>; }
