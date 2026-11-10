import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Clear, modern layout with strong hierarchy",
  "Your real projects featured up front",
  "Skills and technology stack at a glance",
  "Honest project statuses and destinations",
  "Projects, tutorials and community links",
  "Responsive layout across devices",
];

export function HomeChangesPanel() {
  return (
    <aside className="home-changes-panel" aria-labelledby="home-changes-title">
      <h2 id="home-changes-title">What Changed?</h2>
      <ul>
        {highlights.map((item) => (
          <li key={item}>
            <CheckCircle2 aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
