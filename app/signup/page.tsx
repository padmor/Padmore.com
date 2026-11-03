import Link from "next/link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { BrandMark } from "@/components/brand-mark";
import { AuthPhoto } from "@/features/auth/components/auth-photo";
export const metadata = { title: "Create account" };
export default function SignUpPage() { return <section className="page-container auth-page"><div className="auth-aside"><span className="eyebrow">JOIN THE JOURNEY</span><h1>Follow ideas as they become real projects.</h1><p>Save useful resources, follow updates and connect with people building things.</p><AuthPhoto/></div><div className="auth-panel"><Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link><h2>Create an account</h2><p>Start with your basic details.</p><AuthForm mode="signup"/><div className="auth-links"><span>Already have an account? <Link href="/signin">Sign in</Link></span><Link href="/">Back to home</Link></div></div></section>; }
