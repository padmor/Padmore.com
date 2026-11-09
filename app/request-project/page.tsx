import { PageIntro } from "@/components/page-intro";
import { RequestProjectForm } from "@/features/project-requests/components/request-project-form";
import { Icon } from "@/components/icon";
export const metadata = { title: "Start a Project" };
export default function RequestProjectPage() { return <section className="page-container content-page"><PageIntro title="Start a Project" description="Describe your requirements. Every request is read personally and answered by email."/><div className="request-layout"><div className="request-main"><RequestProjectForm/></div><aside className="request-aside"><h2>What happens next</h2><ul className="check-list"><li>I read your request and reply by email</li><li>We agree what is in scope and what is not</li><li>I send a quote and a rough timeline</li><li>You get updates as the work moves along</li></ul></aside></div></section>; }
