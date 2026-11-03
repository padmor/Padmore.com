"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { LinkIcon, linkColour } from "@/features/contact/components/link-icon";
import { linkHandle, platformName, type ContactLink } from "@/features/contact/platforms";

// "Contact me" opens a pop-up with your email and phone from About me and every
// contact link from the manager portal, so a change there shows here too.
export function ContactModal({ links: initialLinks }: { links: ContactLink[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [links, setLinks] = useState(initialLinks);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Opens straight away with what the page loaded, then refreshes from the
  // portal's latest links, so nothing saved since the page loaded is missed.
  async function open() {
    dialog.current?.showModal();
    setLoading(true);
    try {
      const response = await fetch("/contact-links", { cache: "no-store" });
      if (response.ok) setLinks(await response.json());
    } catch {
      // Keep what the page loaded with.
    } finally {
      setLoading(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(linkHandle(url));
      setCopied(url);
      setTimeout(() => setCopied((value) => (value === url ? null : value)), 1800);
    } catch {
      // Copying is a convenience; the link itself still works.
    }
  }

  return <>
    <button type="button" className="button button-outline" onClick={open} aria-haspopup="dialog"><Icon name="mail" size={16}/> Contact me</button>
    <dialog ref={dialog} className="contact-modal" aria-labelledby="contact-modal-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className="contact-modal-inner">
        <div className="contact-modal-head">
          <div><span className="eyebrow">LET&apos;S CONNECT</span><h2 id="contact-modal-title">Get in touch</h2></div>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => dialog.current?.close()}><Icon name="close"/></button>
        </div>
        {links.length > 0
          ? <ul className="contact-modal-list">{links.map((link) => {
            const external = /^https?:/i.test(link.url);
            return <li key={link.url}>
              <a href={link.url} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className="contact-modal-icon" style={{ background: linkColour(link.platform, link.url), color: link.platform === "snapchat" ? "#111" : "#fff" }}><LinkIcon platform={link.platform} url={link.url}/></span>
                <span className="contact-modal-text"><strong>{link.label || platformName(link.platform)}</strong><small>{linkHandle(link.url)}</small></span>
              </a>
              <button type="button" className="icon-button" onClick={() => copy(link.url)} aria-label={`Copy ${link.label || platformName(link.platform)}`}><Icon name={copied === link.url ? "check" : "copy"} size={16}/></button>
            </li>;
          })}</ul>
          : <p className="contact-modal-empty">{loading ? "Loading contact details…" : "Contact details are coming soon. You can still send a message below."}</p>}
        <Link href="/contact" className="button button-primary contact-modal-cta">Send a message <Icon name="arrow" size={16}/></Link>
        <p className="sr-only" aria-live="polite">{copied ? "Copied" : ""}</p>
      </div>
    </dialog>
  </>;
}
