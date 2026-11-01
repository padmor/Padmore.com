import { listPublicAchievements } from "@/modules/portfolio/repository";

const timeline = [
  { title: "Learning foundations", desc: "HTML, CSS and JavaScript practice", date: "Add date" },
  { title: "Building projects", desc: "Applying concepts to practical software", date: "Add date" },
  { title: "Growing the portfolio", desc: "Sharing projects and technical notes", date: "In progress" },
];

export async function AchievementBoard() {
  const achievements = await listPublicAchievements();
  return <>
    <section id="achievements" className="section-block">
      <h2>My achievements</h2>
      <p className="muted-copy">Add verified certificates, awards and milestones here.</p>
      <div className="achievement-grid">{achievements.map((item) => <article className="achievement-card" key={item.title}>
        <span className="achievement-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.subtitle}</p><small>{item.year}</small>
      </article>)}</div>
    </section>
    <section id="timeline" className="section-block">
      <h2>Development timeline</h2>
      <div className="timeline-list">{timeline.map((item) => <div className="timeline-item" key={item.title}>
        <span className="timeline-dot"/><div><h3>{item.title}</h3><p>{item.desc}</p></div><time>{item.date}</time>
      </div>)}</div>
    </section>
  </>;
}
