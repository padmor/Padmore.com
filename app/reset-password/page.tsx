import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/password-forms";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
export const metadata = { title: "Choose a new password", robots: { index: false } };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) { const { token } = await searchParams; return <section className="page-container auth-page"><div className="auth-aside"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Choose a new password.</h1><p>Pick something you don&apos;t use anywhere else.</p><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>New password</h2>{typeof token === "string" && token ? <ResetPasswordForm token={token}/> : <p role="alert">This reset link is invalid. <Link href="/forgot-password">Request a new link</Link>.</p>}<div className="auth-links"><Link href="/signin">Back to sign in</Link></div></div></section>; }
