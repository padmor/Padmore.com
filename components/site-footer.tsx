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
          <p>Build · Learn · Collaborate · Grow</p>
          <p className="footer-note">A personal space for projects, ideas, learning and collaboration.</p>
        </div>
        <div className="footer-column"><strong>Explore</strong><Link href="/projects">Projects</Link><Link href="/tutorials">Tutorials</Link><Link href="/store">Store</Link><Link href="/hosted-apps">Hosted apps</Link></div>
        <div className="footer-column"><strong>Connect</strong><Link href="/build-with-me">Build with me</Link><Link href="/request-project">Request a project</Link><Link href="/community">Community</Link><Link href="/contact">Contact</Link></div>
        <div className="footer-newsletter"><strong>Get occasional updates</strong><p>New projects, useful tutorials and product releases.</p><NewsletterForm compact /></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Padmore Yeb. All rights reserved.</span><div className="social-links">{links.map((link) => <a key={link.url} href={link.url} aria-label={link.label ?? link.platform} target="_blank" rel="noopener noreferrer"><LinkIcon platform={link.platform} url={link.url}/></a>)}<a href="/contact" aria-label="Contact"><Icon name="mail"/></a></div><span className="footer-tagline">Designed to build, share and grow.</span></div>
    </footer>
  );
}
