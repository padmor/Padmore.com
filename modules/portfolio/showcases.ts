import type { Project } from "@/lib/data";

export type PortfolioShowcase = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  status: string;
  statusTone: "live" | "complete" | "progress";
  tags: string[];
  highlights: string[];
  coverKicker: string;
  coverTitle: string;
  coverNote: string;
  theme: "green" | "amber" | "blue";
  websiteUrl?: string;
  websiteLabel?: string;
  matchTerms: string[];
};

export const PORTFOLIO_SHOWCASES: PortfolioShowcase[] = [
  {
    slug: "green-building-creations",
    title: "Green Building Creations",
    subtitle: "Company website · Sustainable design & construction",
    description:
      "A company website for a Ghanaian firm working across planning, architectural design and building construction. The interface presents its services and sustainable, quality-focused approach.",
    status: "Interface completed",
    statusTone: "complete",
    tags: ["Corporate website", "Architecture", "Construction"],
    highlights: [
      "Website interface for the company’s public presence.",
      "Service presentation across planning, architectural design and construction.",
      "Content structured around the firm’s focus on quality, timely delivery and sustainable building.",
    ],
    coverKicker: "GREEN BUILDING CREATIONS",
    coverTitle: "Plan. Design. Build.",
    coverNote: "Sustainable spaces, thoughtfully presented.",
    theme: "green",
    websiteUrl: "https://gh.linkedin.com/company/green-building-creations",
    websiteLabel: "Company profile",
    matchTerms: ["greenbuildingcreations", "greenbuildingcreation", "gbc"],
  },
  {
    slug: "gbhpl",
    title: "GBHPL",
    subtitle: "E-commerce · Business operations",
    description:
      "A rebuild of the Gid’s Beverages & Health Products Ltd. website, bringing product discovery and online ordering together with payment, delivery and manager workflows.",
    status: "Live",
    statusTone: "live",
    tags: ["Online ordering", "Payments", "Delivery", "Manager portal"],
    highlights: [
      "Product browsing and online order flows.",
      "Payment and delivery workflows.",
      "Manager portal for day-to-day product and order operations.",
    ],
    coverKicker: "GID’S BEVERAGES & HEALTH PRODUCTS",
    coverTitle: "From product to doorstep.",
    coverNote: "A connected e-commerce experience.",
    theme: "amber",
    websiteUrl: "https://gbhpl.net/",
    websiteLabel: "Visit live website",
    matchTerms: ["gbhpl", "gidsbeverages", "gidsbeverageshealthproducts"],
  },
  {
    slug: "hostivo",
    title: "Hostivo",
    subtitle: "Accommodation platform · In development",
    description:
      "A hostel accommodation platform designed around online applications, payment tracking and allocation updates for a single residence.",
    status: "In development",
    statusTone: "progress",
    tags: ["Accommodation", "Applications", "Payment tracking", "Allocation"],
    highlights: [
      "Online accommodation application journey.",
      "Payment and allocation status tracking.",
      "A focused single-residence administration workflow.",
    ],
    coverKicker: "HOSTIVO",
    coverTitle: "A clearer way to find a place.",
    coverNote: "Accommodation workflows, brought together.",
    theme: "blue",
    matchTerms: ["hostivo"],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type ResolvedPortfolioShowcase = PortfolioShowcase & {
  imageId?: string;
  databaseProjectHref?: string;
};

export function resolvePortfolioShowcases(projects: Project[] = []): ResolvedPortfolioShowcase[] {
  return PORTFOLIO_SHOWCASES.map((showcase) => {
    const match = projects.find((project) => {
      const searchable = normalize(project.title + project.slug);
      return showcase.matchTerms.some((term) => searchable.includes(normalize(term)));
    });

    return {
      ...showcase,
      imageId: match?.imageId,
      databaseProjectHref: match ? `/projects/${match.slug}` : undefined,
    };
  });
}

export function getPortfolioShowcase(slug: string) {
  return PORTFOLIO_SHOWCASES.find((showcase) => showcase.slug === slug) ?? null;
}
