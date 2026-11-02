import { SiteImage } from "@/features/content/components/site-image";
import { listPublicAchievements } from "@/modules/portfolio/repository";

export async function AchievementBoard() {
  const achievements = await listPublicAchievements();
  return <section id="achievements" className="section-block">
    <h2>My achievements</h2>
    {achievements.length ? <div className="achievement-grid">{achievements.map((item) => <article className="achievement-card" key={item.title}>
      {item.imageId ? <SiteImage id={item.imageId}/> : <span className="achievement-icon">{item.icon}</span>}<h3>{item.title}</h3>{item.organization && <p><strong>{item.organization}</strong></p>}<p>{item.subtitle}</p><small>{item.year}</small>{item.credentialUrl && <p><a className="text-link" href={item.credentialUrl} target="_blank" rel="noopener noreferrer">View certificate</a></p>}
    </article>)}</div> : <p className="muted-copy">Certificates, awards and milestones will appear here.</p>}
  </section>;
}
