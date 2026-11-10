"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/lib/data";
import { useCart } from "@/features/store/providers/cart-provider";
import { useState } from "react";
import { CoverImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { trackEngagement } from "@/lib/engagement/client";
import { RecentlyViewedLink } from "@/features/engagement/components/recently-viewed";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  function handleAdd() {
    add({ slug: product.slug, title: product.title, price: product.price });
    trackEngagement("cart_added", `/store/${product.slug}`, product.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }
  return (
    <button type="button" className={`button ${added ? "button-success" : "button-primary"} button-small`} onClick={handleAdd} aria-live="polite">
      {added ? <><Icon name="check" size={14}/> Added to cart</> : "Add to cart"}
    </button>
  );
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  if (!products.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><Icon name="store" size={26}/></span>
        <h3>The store is opening soon</h3>
        <p>Digital products will appear here when they are ready to browse.</p>
      </div>
    );
  }

  const normalized = query.trim().toLowerCase();
  const filtered = products.filter((product) =>
    (filter === "All" || product.category === filter) &&
    `${product.title} ${product.description}`.toLowerCase().includes(normalized)
  );
  const hasFilters = Boolean(normalized) || filter !== "All";
  const clearFilters = () => { setFilter("All"); setQuery(""); };

  return (
    <>
      <div className="catalog-toolbar">
        <label className="search-box">
          <Icon name="search"/>
          <input placeholder="Search products…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search products"/>
        </label>
        <div className="filter-pills" role="group" aria-label="Filter products by category">
          {categories.map((category) => (
            <button key={category} type="button" className={filter === category ? "filter-pill active" : "filter-pill"} aria-pressed={filter === category} onClick={() => setFilter(category)}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="result-line">
        <span aria-live="polite">Showing <strong>{filtered.length}</strong> of {products.length} {products.length === 1 ? "product" : "products"}</span>
        {hasFilters && <button type="button" className="catalog-clear" onClick={clearFilters}>Clear filters <Icon name="close" size={13}/></button>}
      </div>

      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <article className="product-card" key={product.slug}>
              <RecentlyViewedLink kind="product" slug={product.slug} title={product.title} href={`/store/${product.slug}`} className="product-image-link" onClick={() => trackEngagement("product_open", `/store/${product.slug}`, product.slug)}>
                <CoverImage id={product.imageId} alt={product.title}/>
              </RecentlyViewedLink>
              <div className="product-info">
                <span className="eyebrow">{product.category}</span>
                <h3><RecentlyViewedLink kind="product" slug={product.slug} title={product.title} href={`/store/${product.slug}`} onClick={() => trackEngagement("product_open", `/store/${product.slug}`, product.slug)}>{product.title}</RecentlyViewedLink></h3>
                <p>{product.description}</p>
                <div className="product-buy-row">
                  <strong>{formatPrice(product.price)}</strong>
                  <AddToCartButton product={product}/>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon"><Icon name="search" size={24}/></span>
          <h3>No products match your search</h3>
          <p>Try another search term or category.</p>
          <button type="button" className="button button-secondary" onClick={clearFilters}>Reset filters</button>
        </div>
      )}
    </>
  );
}

export function CartView() {
  const { items, subtotal, remove, clear } = useCart();
  const [checkout, setCheckout] = useState(false);

  if (!items.length) {
    return (
      <div className="empty-state cart-empty">
        <span className="empty-icon"><Icon name="store" size={26}/></span>
        <h3>Your cart is empty</h3>
        <p>Explore the store and add a digital product to get started.</p>
        <Link href="/store" className="button button-primary">Explore the store <Icon name="arrow" size={16}/></Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="cart-list">
        <div className="cart-list-heading">
          <div><h2>Your items</h2><p>{items.length} {items.length === 1 ? "item" : "items"} in your cart</p></div>
          <button type="button" className="catalog-clear" onClick={clear}>Clear cart</button>
        </div>
        {items.map((item) => (
          <div className="cart-row" key={item.slug}>
            <div className="cart-item-icon"><Icon name="code" size={23}/></div>
            <div className="cart-item-copy"><strong>{item.title}</strong><span>{formatPrice(item.price)} · Quantity {item.quantity}</span></div>
            <strong className="cart-row-total">{formatPrice(item.price * item.quantity)}</strong>
            <button type="button" className="icon-button" onClick={() => remove(item.slug)} aria-label={`Remove ${item.title}`}><Icon name="close" size={16}/></button>
          </div>
        ))}
        <Link href="/store" className="cart-continue-link"><Icon name="arrow" size={15}/> Continue browsing</Link>
      </div>

      <aside className="cart-summary">
        <h2>Order summary</h2>
        <div className="summary-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
        <div className="summary-line"><span>Tax</span><span>Calculated at checkout</span></div>
        <div className="summary-total"><span>Estimated total</span><strong>{formatPrice(subtotal)}</strong></div>
        <button type="button" className="button button-primary button-full" onClick={() => setCheckout(true)}>Continue to checkout <Icon name="arrow" size={16}/></button>
        <p className="form-footnote"><Icon name="info" size={14}/> Online payments and downloads are not available yet.</p>
        {checkout && <div className="inline-notice" role="status"><Icon name="info"/> Checkout will be enabled after secure payment and order verification are configured.</div>}
      </aside>
    </div>
  );
}
