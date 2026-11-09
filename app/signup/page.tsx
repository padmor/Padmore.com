import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
import { AuthBenefits } from "@/features/auth/components/auth-benefits";
import { safeReturnPath } from "@/lib/auth/return-path";
export const metadata = { title: "Create account" };
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { const next = safeReturnPath((await searchParams).next); const withNext = next ? `?next=${encodeURIComponent(next)}` : ""; return <section className="page-container auth-page"><div className="auth-aside"><h1>Create your free account.</h1><p>One account gives you:</p><AuthBenefits/><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>Create an account</h2><p>Start with your basic details.</p><AuthForm mode="signup" next={next}/><div className="auth-links"><span>Already have an account? <Link href={`/signin${withNext}`}>Sign in</Link></span><Link href="/">Back to home</Link></div></div></section>; }
