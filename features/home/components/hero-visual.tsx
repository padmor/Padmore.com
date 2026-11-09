import { SiteImage } from "@/features/content/components/site-image";

export function HeroVisual({ photoId }: { photoId?: string | null }) {
  return (
    <div className="home-hero-visual">
      <div className="home-hero-photo-decoration" aria-hidden="true" />
      <div className="home-hero-photo-frame">
        {photoId ? (
          <SiteImage id={photoId} alt="Padmore Yeb, web and mobile application developer" />
        ) : (
          <div className="home-hero-photo-fallback" role="img" aria-label="Padmore Yeb">
            <span>PY</span>
            <small>Web &amp; Mobile Developer</small>
          </div>
        )}
      </div>
      <div className="home-hero-availability">
        <span aria-hidden="true" />
        Available for collaboration
      </div>
    </div>
  );
}
