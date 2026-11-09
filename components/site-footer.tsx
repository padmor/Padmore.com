import Link from "next/link";
import { Icon } from "@/components/icon";
import { NewsletterForm } from "@/features/contact/components/newsletter-form";
import { LinkIcon } from "@/features/contact/components/link-icon";
import { listSocialLinks } from "@/modules/content/repository";
import { BrandMark } from "@/components/brand-mark";

// The footer is on every page, so a database problem must not take a page down with it.
export async function SiteFooter() {
  const links = await listSocialLinks().catch(() => []);
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="brand"><BrandMark/><span>Padmore Yeb</span></Link>
          <p className="footer-note">Build · Learn · Share</p>
        </div>

        <div className="footer-column">
          <strong>Quick Links</strong>
          <Link href="/projects">Projects</Link>
          <Link href="/tutorials">Tutorials</Link>
          <Link href="/community">Community</Link>
          <Link href="/about">About</Link>
          <Link href="/store">Store</Link>
          <Link href="/signin">Sign in</Link>
        </div>

        <div className="footer-column footer-connect">
          <strong>Connect</strong>
          {links.slice(0, 4).map((link) => (
            <a key={link.url} href={link.url} aria-label={link.label ?? link.platform} target="_blank" rel="noopener noreferrer">
              <LinkIcon platform={link.platform} url={link.url}/>
              <span>{link.label ?? link.platform}</span>
            </a>
          ))}
          <Link href="/contact"><Icon name="mail" size={16}/><span>Email</span></Link>
        </div>

        <div className="footer-newsletter" id="newsletter">
          <strong>Subscribe for updates</strong>
          <p>Get notified about new projects and tutorials.</p>
          <NewsletterForm compact />
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Padmore Yeb. All rights reserved.</span>
        <div className="social-links">
          {links.map((link) => <a key={link.url} href={link.url} aria-label={link.label ?? link.platform} target="_blank" rel="noopener noreferrer"><LinkIcon platform={link.platform} url={link.url}/></a>)}
          <a href="/contact" aria-label="Contact"><Icon name="mail"/></a>
        </div>
      </div>
    </footer>
  );
}
