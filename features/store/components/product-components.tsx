"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/lib/data";
import { useCart } from "@/features/store/providers/cart-provider";
import { useState } from "react";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";

export function ProductArtwork({ visual }: { visual: Product["visual"] }) {
  const symbols = { design: "✦", toolkit: "⌘", react: "⚛", bundle: "✧" };
  return <div className={`product-art product-${visual}`} aria-hidden="true"><span className="product-art-glow"/><strong>{symbols[visual]}</strong><i/><i/></div>;
}

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  function handleAdd() { add({ slug: product.slug, title: product.title, price: product.price }); setAdded(true); window.setTimeout(() => setAdded(false), 1800); }
  return <button type="button" className={`button ${added ? "button-success" : "button-primary"} button-small`} onClick={handleAdd}>{added ? <><Icon name="check" size={14}/> Added</> : "Add to cart"}</button>;
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  if (!products.length) return <div className="empty-state"><span className="empty-icon"><Icon name="store" size={26}/></span><h3>The store is opening soon</h3><p>Products will appear here as soon as they're published.</p></div>;
  const filtered = products.filter((product) => (filter === "All" || product.category === filter) && `${product.title} ${product.description}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="catalog-toolbar"><label className="search-box"><Icon name="search"/><input placeholder="Search products..." value={query} onChange={(event) => setQuery(event.target.value)}/></label><div className="filter-pills">{categories.map((category) => <button key={category} className={filter === category ? "filter-pill active" : "filter-pill"} onClick={() => setFilter(category)}>{category}</button>)}</div></div>
    {filtered.length ? <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.slug}><Link href={`/store/${product.slug}`}>{product.imageId ? <SiteImage id={product.imageId}/> : <ProductArtwork visual={product.visual}/>}</Link><div className="product-info"><span className="eyebrow">{product.category}</span><h3><Link href={`/store/${product.slug}`}>{product.title}</Link></h3><p>{product.description}</p><div className="product-buy-row"><strong>{formatPrice(product.price)}</strong><AddToCartButton product={product}/></div></div></article>)}</div> : <div className="empty-state"><h3>No products found</h3><p>Try another search or category.</p></div>}
  </>;
}

export function CartView() {
  const { items, subtotal, remove, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  if (!items.length) return <div className="empty-state cart-empty"><span className="empty-icon"><Icon name="store" size={26}/></span><h3>Your cart is empty</h3><p>Explore the store and add a product to get started.</p><Link href="/store" className="button button-primary">Explore the store <Icon name="arrow" size={16}/></Link></div>;
  return <div className="cart-layout"><div className="cart-list">{items.map((item) => <div className="cart-row" key={item.slug}><div className="cart-item-icon"><Icon name="code" size={23}/></div><div className="cart-item-copy"><strong>{item.title}</strong><span>{formatPrice(item.price)} · Quantity {item.quantity}</span></div><strong>{formatPrice(item.price * item.quantity)}</strong><button className="icon-button" onClick={() => remove(item.slug)} aria-label={`Remove ${item.title}`}><Icon name="close" size={16}/></button></div>)}<button className="text-link" onClick={clear}>Clear cart</button></div><aside className="cart-summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-line"><span>Tax</span><span>Calculated at checkout</span></div><div className="summary-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div><button className="button button-primary button-full" onClick={() => setCheckout(true)}>Continue to checkout <Icon name="arrow" size={16}/></button><p className="form-footnote">Demo cart only. Live payments and secure downloads are not connected.</p>{checkout && <div className="inline-notice" role="status"><Icon name="info"/> Checkout will be enabled after secure payment and order verification are configured.</div>}</aside></div>;
}
