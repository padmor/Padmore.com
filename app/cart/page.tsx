import { PageIntro } from "@/components/page-intro";
import { CartView } from "@/features/store/components/product-components";
export const metadata = { title: "Cart" };
export default function CartPage() { return <section className="page-container content-page"><PageIntro eyebrow="YOUR SELECTION" title="Shopping cart" description="Review the digital products you've added."/><CartView/></section>; }
