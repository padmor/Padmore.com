export default function Loading() {
  return <div className="page-container loading-page" aria-label="Loading page"><div className="skeleton skeleton-title"/><div className="skeleton skeleton-copy"/><div className="skeleton-grid">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton skeleton-image"/><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/></div>)}</div></div>;
}
