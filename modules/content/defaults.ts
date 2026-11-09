import type { AboutContent } from "@/modules/admin/collections";

// Shown until the first save in the manager portal.
export const DEFAULT_ABOUT: AboutContent = {
  headline: "Curious about technology. Focused on useful solutions.",
  intro: "I'm Padmore Yeb. I enjoy learning, building digital products and turning practical problems into useful software.",
  bio: [
    "I'm Padmore Yeb, a developer based in Ghana who builds web products end to end, from the database and server through to the interface people actually use. I care about software that solves a real problem, holds up under daily use and is clear enough for the next person to maintain.",
    "My work spans full-stack web development: designing data models, writing secure server logic, connecting authentication and building responsive, accessible interfaces. This site is an example. I designed and built it myself, including the manager portal that runs its projects, tutorials, store and updates.",
    "I approach every project the same way. I start by understanding the problem, keep the structure simple, and test the result before calling it done. Clean code, sensible security and attention to detail matter to me as much as the features themselves.",
    "Learning is a constant part of how I work. I study new tools and techniques, take on projects that stretch my skills, and write tutorials so others can learn from what I've figured out along the way.",
    "I'm open to collaborations, freelance projects and opportunities to join teams building meaningful products. If you have an idea, a problem to solve or a role to fill, I would be glad to hear from you.",
  ].join("\n\n"),
  location: "Ghana",
  mission: "To build useful, secure and well-made software that solves real problems for real people, and to share what I learn along the way.",
  vision: "To grow into a developer whose products are trusted and widely used, and to help other people in Ghana and beyond learn to build for the web.",
  skills: [],
};
