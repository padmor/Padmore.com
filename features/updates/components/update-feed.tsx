import { Icon } from "@/components/icon";

const updates = [
  { type: "Project update", title: "Portfolio foundation", text: "Planning a modular portfolio with responsive layouts and clear interaction patterns.", date: "Planning note" },
  { type: "Learning note", title: "Modern CSS and responsive design", text: "Exploring fluid layouts, container queries and accessible component states.", date: "Learning journey" },
  { type: "Build log", title: "A better development workflow", text: "Documenting architecture, code quality and performance decisions.", date: "Planning note" },
];

export function UpdateFeed() {
  return <div className="updates-feed">{updates.map((item) => <article className="update-card" key={item.title}>
    <span className="update-type">{item.type}</span><h2>{item.title}</h2><p>{item.text}</p>
    <div className="update-meta"><span><Icon name="clock" size={14}/> {item.date}</span><span>Preview content</span></div>
  </article>)}</div>;
}
