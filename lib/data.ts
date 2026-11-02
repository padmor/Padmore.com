export type ProjectStatus = "Idea" | "Planning" | "In Progress" | "Testing" | "Beta" | "Live" | "Paused" | "Completed";
export type Project = {
  slug: string;
  title: string;
  type: string;
  description: string;
  details?: string;
  demoUrl?: string;
  status: ProjectStatus;
  stack: string[];
  category: string;
  visual: "commerce" | "tasks" | "portfolio" | "weather" | "study" | "chat";
  updated: string;
  featured?: boolean;
  tested?: boolean;
  startedOn?: string;
  completedOn?: string;
  imageId?: string;
};

export type Tutorial = {
  slug: string;
  title: string;
  category: string;
  description: string;
  minutes: number;
  level: string;
  visual: "react" | "css" | "javascript" | "node" | "git" | "api";
  body?: string;
  videoUrl?: string;
  imageId?: string;
};

export type Product = {
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  visual: "design" | "toolkit" | "react" | "bundle";
  license?: string;
  type?: string;
  imageId?: string;
};

export const TUTORIAL_CATEGORIES = ["Web Development", "Design", "Programming", "Backend", "Tools"] as const;
export const PRODUCT_CATEGORIES = ["Templates", "Tools", "Courses", "Graphics"] as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Store", href: "/store" },
  { label: "Community", href: "/community" },
  { label: "More", href: "/about" },
];

export function formatPrice(amount: number): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);
}
