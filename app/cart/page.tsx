import { PageIntro } from "@/components/page-intro";
import { CartView } from "@/features/store/components/product-components";
export const metadata = { title: "Cart" };
export default function CartPage() { return <section className="page-container content-page"><PageIntro title="Shopping cart" description="Review the digital products in your cart."/><CartView/></section>; }
