import { PageIntro } from "@/components/page-intro";
import { ContactForm } from "@/features/contact/components/contact-form";
import { Icon } from "@/components/icon";
import { getAbout, listSocialLinks } from "@/modules/content/repository";
export const metadata = { title: "Contact" };
export const revalidate = 300;
const ICONS = { github: "github", linkedin: "linkedin", email: "mail", website: "globe", other: "globe" } as const;
export default async function ContactPage() { const [links, about] = await Promise.all([listSocialLinks(), getAbout()]); return <section className="page-container content-page"><PageIntro eyebrow="LET'S CONNECT" title="Contact" description="Have a project, idea or question? Send a message and tell me what you're working on."/><div className="contact-layout"><ContactForm/><aside className="contact-aside"><h2>Other ways to connect</h2>{links.map((link) => <div className="contact-method" key={link.url}><span><Icon name={ICONS[link.platform as keyof typeof ICONS] ?? "globe"}/></span><div><strong>{link.label}</strong><p><a className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.url.replace(/^(mailto:|https?:\/\/)/, "")}</a></p></div></div>)}{about.location && <div className="contact-method"><span><Icon name="map"/></span><div><strong>Location</strong><p>{about.location}</p></div></div>}</aside></div></section>; }
