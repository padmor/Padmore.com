import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
import { AuthBenefits } from "@/features/auth/components/auth-benefits";
import { safeReturnPath } from "@/lib/auth/return-path";
export const metadata = { title: "Sign in" };
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const next = safeReturnPath((await searchParams).next); const withNext = next ? `?next=${encodeURIComponent(next)}` : ""; return <section className="page-container auth-page"><div className="auth-aside"><h1>Pick up where you left off.</h1><p>Your saved items and what is new from Padmore Yeb are waiting.</p><AuthBenefits/><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>Sign in</h2><p>Enter your details to continue.</p><AuthForm mode="signin" next={next}/><div className="auth-links"><Link href="/forgot-password">Forgot your password?</Link><span>New here? <Link href={`/signup${withNext}`}>Create an account</Link></span><Link href="/">Back to home</Link></div></div></section>; }
