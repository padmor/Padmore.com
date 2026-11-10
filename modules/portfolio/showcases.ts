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
  mark: string;
  referenceCoverIndex: number;
  theme: "green" | "amber" | "blue" | "navy";
  websiteUrl?: string;
  websiteLabel?: string;
  matchTerms: string[];
};

export const PORTFOLIO_SHOWCASES: PortfolioShowcase[] = [
  {
    slug: "green-building-creations",
    title: "Green Building Creations",
    subtitle: "Sustainable construction website",
    description:
      "A company website for a Ghanaian firm working across planning, architectural design and building construction.",
    status: "Interface completed",
    statusTone: "complete",
    tags: ["Corporate website", "Architecture", "Construction"],
    highlights: [
      "Company website interface for the public-facing brand.",
      "Service presentation across planning, architectural design and construction.",
      "Content structured around quality, timely delivery and sustainable building.",
    ],
    coverKicker: "GREEN BUILDING CREATIONS",
    coverTitle: "Plan. Design. Build.",
    coverNote: "Sustainable spaces, thoughtfully presented.",
    mark: "GBC",
    referenceCoverIndex: 0,
    theme: "green",
    websiteUrl: "https://gh.linkedin.com/company/green-building-creations",
    websiteLabel: "Company profile",
    matchTerms: ["greenbuildingcreations", "greenbuildingcreation"],
  },
  {
    slug: "gbhpl",
    title: "GBHPL",
    subtitle: "Beverages eCommerce platform",
    description:
      "A rebuild of Gid’s Beverages & Health Products Ltd., combining product discovery and online ordering with payment, delivery and manager workflows.",
    status: "Live",
    statusTone: "live",
    tags: ["Online ordering", "Payments", "Delivery", "Manager portal"],
    highlights: [
      "Product browsing and online ordering.",
      "Payment and delivery workflows.",
      "Manager portal for product and order operations.",
    ],
    coverKicker: "GID’S BEVERAGES & HEALTH PRODUCTS",
    coverTitle: "From product to doorstep.",
    coverNote: "A connected e-commerce experience.",
    mark: "G",
    referenceCoverIndex: 1,
    theme: "amber",
    websiteUrl: "https://gbhpl.net/",
    websiteLabel: "Visit live website",
    matchTerms: ["gbhpl", "gidsbeverages", "gidsbeverageshealthproducts"],
  },
  {
    slug: "hostivo",
    title: "Hostivo",
    subtitle: "Hostel booking system",
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
    mark: "H",
    referenceCoverIndex: 2,
    theme: "blue",
    matchTerms: ["hostivo"],
  },
  {
    slug: "nexus",
    title: "Nexus",
    subtitle: "All-in-one AI hardware concept",
    description:
      "An offline-first hardware concept exploring natural voice and gesture control for computers, phones and connected devices.",
    status: "In Progress",
    statusTone: "progress",
    tags: ["AI hardware", "Voice control", "Gesture interaction", "Offline-first"],
    highlights: [
      "Explores natural voice and gesture-based device control.",
      "Designed around offline-first operation, with connectivity when permitted.",
      "A hardware-assisted concept currently being developed and explored.",
    ],
    coverKicker: "NEXUS · CIRCUIT REBELS",
    coverTitle: "Control, naturally.",
    coverNote: "An offline-first AI hardware concept.",
    mark: "N",
    referenceCoverIndex: 3,
    theme: "navy",
    matchTerms: ["nexus"],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type ResolvedPortfolioShowcase = PortfolioShowcase & {
  imageId?: string;
};

export function resolvePortfolioShowcases(projects: Project[] = []): ResolvedPortfolioShowcase[] {
  return PORTFOLIO_SHOWCASES.map((showcase) => {
    const match = projects.find((project) => {
      const source = `${project.title} ${project.slug}`.toLowerCase();
      const tokens = source.split(/[^a-z0-9]+/).filter(Boolean);
      const searchable = normalize(source);
      return showcase.matchTerms.some((term) =>
        term.length <= 3 ? tokens.includes(term.toLowerCase()) : searchable.includes(normalize(term))
      );
    });

    return {
      ...showcase,
      imageId: match?.imageId,
    };
  });
}

export function getPortfolioShowcase(slug: string) {
  return PORTFOLIO_SHOWCASES.find((showcase) => showcase.slug === slug) ?? null;
}
