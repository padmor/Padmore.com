import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() { return <section className="page-container error-page"><span className="error-code">404</span><h1>That page isn't here.</h1><p>The page may have moved, or the address may be incorrect.</p><Link className="button button-primary" href="/">Back to homepage <Icon name="arrow" size={16}/></Link></section>; }
