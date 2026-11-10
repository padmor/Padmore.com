import { PageIntro } from "@/components/page-intro";
import { CollaborationForm } from "@/features/collaboration/components/collaboration-form";
import { listOpenOpportunities } from "@/modules/content/repository";
import { SiteImage } from "@/features/content/components/site-image";
import { Icon } from "@/components/icon";
import { ArrowRight, Handshake, Users } from "lucide-react";

export const metadata = { title: "Collaborate" };
export const revalidate = 300;

export default async function BuildWithMePage() {
  const opportunities = await listOpenOpportunities();

  return (
    <section className="page-container content-page collaboration-page">
      <PageIntro
        eyebrow="WORK TOGETHER"
        title="Build something meaningful."
        description="I welcome thoughtful collaboration with people who enjoy solving problems and making useful digital products."
        action={<a href="#apply" className="button button-primary">Introduce yourself <ArrowRight size={16}/></a>}
      />

      <div className="collaboration-welcome">
        <span className="collaboration-welcome-icon"><Handshake aria-hidden="true"/></span>
        <div>
          <h2>Open to good ideas and good people.</h2>
          <p>Whether you design, develop, write, test or help shape products, share what you do and how you would like to contribute.</p>
        </div>
        <span className="collaboration-welcome-art" aria-hidden="true"><Users/></span>
      </div>

      <section className="collaboration-opportunities" aria-labelledby="opportunities-title">
        <div className="section-heading">
          <div>
            <h2 id="opportunities-title">Open opportunities</h2>
            <p>{opportunities.length ? "Current roles and areas where collaboration may be useful." : "There are no specific roles open right now, but you can still introduce yourself."}</p>
          </div>
        </div>

        {opportunities.length > 0 ? (
          <div className="opportunity-list">
            {opportunities.map((item) => (
              <article className="opportunity-card" key={item.id}>
                {item.imageId ? (
                  <div className="opportunity-cover"><SiteImage id={item.imageId} alt={item.title}/></div>
                ) : (
                  <div className="opportunity-icon"><Icon name="users"/></div>
                )}
                <div className="opportunity-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="tag-row">
                    {[item.area, item.commitment, item.arrangement].filter(Boolean).map((tag) => (
                      <span className="tech-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <a className="button button-outline button-small" href="#apply">Apply <Icon name="arrow-up-right" size={14}/></a>
              </article>
            ))}
          </div>
        ) : (
          <div className="collaboration-no-roles">
            <span><Users aria-hidden="true"/></span>
            <div><strong>No listed roles at the moment</strong><p>Use the introduction form below to share your background and interests.</p></div>
          </div>
        )}
      </section>

      <section className="collaboration-apply" id="apply" aria-labelledby="apply-title">
        <div className="form-section-heading">
          <span className="eyebrow">SAY HELLO</span>
          <h2 id="apply-title">Introduce yourself</h2>
          <p>Share your skills, experience and what you would enjoy contributing. This is an expression of interest, not a confirmed role.</p>
        </div>
        <CollaborationForm opportunities={opportunities.map((item) => item.title)}/>
      </section>
    </section>
  );
}
