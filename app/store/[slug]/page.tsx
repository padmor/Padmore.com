import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/data";
import { AddToCartButton } from "@/features/store/components/product-components";
import { getPublicProduct } from "@/modules/content/repository";
import { CoverImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
export const revalidate = 300;
// The page and its metadata share one lookup per request.
const loadProduct = cache(getPublicProduct);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = await loadProduct((await params).slug);
  return found ? { title: found.title, description: found.description, openGraph: { title: found.title, description: found.description } } : {};
}
export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params; const product = await loadProduct(slug); if (!product) notFound();
 return <section className="page-container detail-page"><Link href="/store" className="back-link"><Icon name="arrow" size={15}/> Back to store</Link><div className="product-detail-layout"><div className="product-detail-art"><CoverImage id={product.imageId} alt={product.title}/></div><div className="product-detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.title}</h1><p>{product.description}</p><div className="product-price-large">{formatPrice(product.price)}</div><AddToCartButton product={product}/><div className="product-includes"><h3>Product information</h3><div><Icon name="check"/> Type: {product.type}</div>{product.license && <div><Icon name="check-circle"/> License: {product.license}</div>}</div><div className="notice-box"><Icon name="info"/><p>Checkout is not open yet. You can add this product to your cart to keep your shortlist, then subscribe for an update when purchases are enabled.</p></div><Link className="product-release-link" href="/#newsletter">Get product release updates <Icon name="arrow-up-right" size={15}/></Link></div></div></section>;
}
