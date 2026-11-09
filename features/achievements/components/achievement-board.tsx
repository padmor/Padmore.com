import { listPublicAchievements } from "@/modules/portfolio/repository";
import { AchievementExplorer } from "./achievement-explorer";

export async function AchievementBoard() {
  const achievements = await listPublicAchievements();
  return <section id="achievements" aria-label="Certificates, awards and milestones"><AchievementExplorer achievements={achievements}/></section>;
}
