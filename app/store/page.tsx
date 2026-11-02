import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { ProductCatalog } from "@/features/store/components/product-components";
import { listPublicProducts } from "@/modules/content/repository";
import { Icon } from "@/components/icon";
export const metadata = { title: "Store" };
export const revalidate = 300;
export default async function StorePage() { const products = await listPublicProducts(); return <section className="page-container content-page"><PageIntro eyebrow="DIGITAL PRODUCTS" title="Store" description="Get premium tools, digital products and resources to boost your productivity." action={<Link href="/cart" className="button button-outline"><Icon name="store" size={16}/> View cart</Link>}/><ProductCatalog products={products}/><div className="store-note"><Icon name="info"/><p>Checkout isn't open yet. You can browse and add to your cart, but nothing can be bought until payments are connected.</p></div></section>; }
