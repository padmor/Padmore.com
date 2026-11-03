import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
export const metadata = { title: "Sign in" };
export default function SignInPage() { return <section className="page-container auth-page"><div className="auth-aside"><span className="eyebrow">WELCOME BACK</span><h1>Pick up where you left off.</h1><p>Keep track of saved projects, updates and the work you're following.</p><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>Sign in</h2><p>Enter your details to continue.</p><AuthForm mode="signin"/><div className="auth-links"><Link href="/forgot-password">Forgot your password?</Link><span>New here? <Link href="/signup">Create an account</Link></span><Link href="/">Back to home</Link></div></div></section>; }
