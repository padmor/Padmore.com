import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/data";
import { ProductArtwork, AddToCartButton } from "@/features/store/components/product-components";
import { getPublicProduct } from "@/modules/content/repository";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
export const revalidate = 300;
export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const product = await getPublicProduct(slug); if (!product) notFound();
 return <section className="page-container detail-page"><Link href="/store" className="back-link"><Icon name="arrow" size={15}/> Back to store</Link><div className="product-detail-layout"><div className="product-detail-art">{product.imageId ? <SiteImage id={product.imageId} alt={product.title}/> : <ProductArtwork visual={product.visual}/>}</div><div className="product-detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.title}</h1><p>{product.description}</p><div className="product-price-large">{formatPrice(product.price)}</div><AddToCartButton product={product}/><div className="product-includes"><h3>Product information</h3><div><Icon name="check"/> Type: {product.type}</div>{product.license && <div><Icon name="check-circle"/> License: {product.license}</div>}</div><div className="notice-box"><Icon name="info"/><p>Checkout isn't open yet. Nothing can be bought until payments are connected.</p></div></div></div></section>;
}
