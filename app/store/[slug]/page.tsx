import Link from "next/link";
import { notFound } from "next/navigation";
import { products, formatPrice } from "@/lib/data";
import { ProductArtwork, AddToCartButton } from "@/features/store/components/product-components";
import { Icon } from "@/components/icon";
export function generateStaticParams() { return products.map((item) => ({ slug: item.slug })); }
export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const product = products.find((item) => item.slug === slug); if (!product) notFound();
 return <section className="page-container detail-page"><Link href="/store" className="back-link"><Icon name="arrow" size={15}/> Back to store</Link><div className="product-detail-layout"><div className="product-detail-art"><ProductArtwork visual={product.visual}/></div><div className="product-detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.title}</h1><p>{product.description}</p><div className="product-price-large">{formatPrice(product.price)}</div><AddToCartButton product={product}/><div className="product-includes"><h3>Product information</h3><div><Icon name="check-circle"/> License: {product.license}</div><div><Icon name="download"/> Delivery: secure download after payment integration</div><div><Icon name="check"/> Updates: release policy to be defined</div></div><div className="notice-box"><Icon name="info"/><p>Preview product listing. Payment processing and downloadable files are not connected.</p></div></div></div></section>;
}
