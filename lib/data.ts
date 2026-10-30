export type ProjectStatus = "Live" | "In Progress" | "Testing" | "Completed" | "Beta";
export type Project = {
  slug: string;
  title: string;
  type: string;
  description: string;
  status: ProjectStatus;
  stack: string[];
  category: string;
  visual: "commerce" | "tasks" | "portfolio" | "weather" | "study" | "chat";
  updated: string;
  featured?: boolean;
};

// Illustrative portfolio entries: replace or edit these with verified project details.
export const projects: Project[] = [
  {
    slug: "e-commerce-platform",
    title: "E-Commerce Platform",
    type: "Web Application",
    description: "A modern commerce experience with product discovery, secure account flows and a responsive management interface.",
    status: "Completed",
    stack: ["React", "Next.js", "PostgreSQL"],
    category: "Web Apps",
    visual: "commerce",
    updated: "Recently updated",
    featured: true,
  },
  {
    slug: "task-management-app",
    title: "Task Management App",
    type: "Mobile + Web",
    description: "A focused workspace for organizing tasks, tracking progress and keeping teams aligned.",
    status: "In Progress",
    stack: ["TypeScript", "React", "Node.js"],
    category: "Mobile Apps",
    visual: "tasks",
    updated: "In development",
    featured: true,
  },
  {
    slug: "portfolio-website",
    title: "Portfolio Website",
    type: "Web Design",
    description: "A responsive personal portfolio concept centered on clear storytelling and selected work.",
    status: "Completed",
    stack: ["Next.js", "CSS", "TypeScript"],
    category: "Design",
    visual: "portfolio",
    updated: "Recently updated",
    featured: true,
  },
  {
    slug: "weather-dashboard",
    title: "Weather Dashboard",
    type: "Web Application",
    description: "A compact weather interface concept for reviewing conditions and forecast information.",
    status: "Live",
    stack: ["React", "API", "CSS"],
    category: "Web Apps",
    visual: "weather",
    updated: "Live demo concept",
    featured: true,
  },
  {
    slug: "study-planner",
    title: "Study Planner",
    type: "Mobile App",
    description: "A study planning concept with schedules, goals and progress summaries.",
    status: "Testing",
    stack: ["React Native", "Expo"],
    category: "Mobile Apps",
    visual: "study",
    updated: "Under testing",
  },
  {
    slug: "chat-application",
    title: "Chat Application",
    type: "Web Application",
    description: "A messaging interface concept with conversations, presence and responsive layouts.",
    status: "Beta",
    stack: ["TypeScript", "Node.js", "WebSocket"],
    category: "Web Apps",
    visual: "chat",
    updated: "Private beta concept",
  },
];

export type Tutorial = {
  slug: string;
  title: string;
  category: string;
  description: string;
  minutes: number;
  level: string;
  visual: "react" | "css" | "javascript" | "node" | "git" | "api";
};

export const tutorials: Tutorial[] = [
  { slug: "getting-started-with-react", title: "Getting Started with React", category: "Web Development", description: "Understand components, props and the mindset behind building interfaces with React.", minutes: 12, level: "Beginner", visual: "react" },
  { slug: "css-grid-layout-guide", title: "CSS Grid Layout Guide", category: "Design", description: "Build adaptable layouts with grid tracks, intrinsic sizing and responsive patterns.", minutes: 15, level: "Intermediate", visual: "css" },
  { slug: "javascript-basics-for-beginners", title: "JavaScript Basics for Beginners", category: "Programming", description: "A practical introduction to variables, functions, events and browser logic.", minutes: 45, level: "Beginner", visual: "javascript" },
  { slug: "building-a-rest-api", title: "Building a REST API with Node.js", category: "Backend", description: "Structure routes, validate requests and return predictable API responses.", minutes: 18, level: "Intermediate", visual: "node" },
  { slug: "git-github-workflow", title: "Git & GitHub Workflow", category: "Tools", description: "Use branches, commits and pull requests to keep software changes organized.", minutes: 16, level: "Beginner", visual: "git" },
  { slug: "working-with-apis", title: "Working with APIs", category: "Backend", description: "Fetch remote data, handle loading states and recover from request failures.", minutes: 22, level: "Intermediate", visual: "api" },
];

export type Product = {
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  visual: "design" | "toolkit" | "react" | "bundle";
  license: string;
};

export const products: Product[] = [
  { slug: "ui-design-system", title: "UI Design System", category: "Templates", description: "A reusable interface starter with design tokens and component patterns.", price: 25, visual: "design", license: "Personal and commercial project use" },
  { slug: "developer-toolkit", title: "Developer Toolkit", category: "Tools", description: "A practical starter bundle for organizing small web projects.", price: 49, visual: "toolkit", license: "Single developer license" },
  { slug: "react-course", title: "React Course", category: "Courses", description: "A structured learning resource for component-driven interface development.", price: 79, visual: "react", license: "Individual learning license" },
  { slug: "digital-art-bundle", title: "Digital Art Bundle", category: "Graphics", description: "A collection of editable digital assets for personal projects.", price: 49, visual: "bundle", license: "Personal and commercial project use" },
];

export const opportunities = [
  { id: "mobile-dev", title: "Mobile App Developer", area: "Mobile Apps", commitment: "Part-time", arrangement: "Discuss together", description: "Collaborate on a mobile product prototype and its first release." },
  { id: "uiux", title: "UI/UX Designer", area: "Product Design", commitment: "Flexible", arrangement: "Discuss together", description: "Help shape clear, accessible experiences for early-stage software ideas." },
  { id: "backend", title: "Backend Developer", area: "Backend Systems", commitment: "Project-based", arrangement: "Discuss together", description: "Work on data models, APIs and secure application workflows." },
];

export const achievements = [
  { title: "React", subtitle: "Learning milestone", year: "Add year", icon: "⚛" },
  { title: "TypeScript", subtitle: "Learning milestone", year: "Add year", icon: "TS" },
  { title: "Next.js", subtitle: "Learning milestone", year: "Add year", icon: "N" },
  { title: "Git & GitHub", subtitle: "Development workflow", year: "Add year", icon: "⌘" },
];

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Store", href: "/store" },
  { label: "Community", href: "/community" },
  { label: "More", href: "/about" },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
