import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ProductCatalog } from "@/features/store/components/product-components";
import { Icon } from "@/components/icon";
export const metadata = { title: "Store" };
export default function StorePage() { return <section className="page-container content-page"><PageIntro eyebrow="DIGITAL PRODUCTS" title="Store" description="Get premium tools, digital products and resources to boost your productivity." action={<Link href="/cart" className="button button-outline"><Icon name="store" size={16}/> View cart</Link>}/><ProductCatalog/><div className="store-note"><Icon name="info"/><p>Sample products and pricing are illustrative. Secure payments, licenses and downloads must be connected before selling.</p></div></section>; }
