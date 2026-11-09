import { PageIntro } from "@/components/page-intro";
import { ContactForm } from "@/features/contact/components/contact-form";
import { Icon } from "@/components/icon";
import { contactLinks, linkHandle } from "@/features/contact/platforms";
import { LinkIcon } from "@/features/contact/components/link-icon";
import { getAbout, listSocialLinks } from "@/modules/content/repository";
export const metadata = { title: "Contact" };
export const revalidate = 300;
export default async function ContactPage() { const [saved, about] = await Promise.all([listSocialLinks(), getAbout()]); const links = contactLinks(about, saved); return <section className="page-container content-page"><PageIntro title="Contact" description="Have a project or an enquiry? Send a message and I will respond by email."/><div className="contact-layout"><ContactForm/><aside className="contact-aside"><h2>Other ways to reach me</h2>{links.map((link) => <div className="contact-method" key={link.url}><span><LinkIcon platform={link.platform} url={link.url}/></span><div><strong>{link.label}</strong><p><a className="text-link" href={link.url} target="_blank" rel="noopener noreferrer">{linkHandle(link.url)}</a></p></div></div>)}{about.location && <div className="contact-method"><span><Icon name="map"/></span><div><strong>Location</strong><p>{about.location}</p></div></div>}</aside></div></section>; }
