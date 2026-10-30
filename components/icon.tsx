import type { SVGProps } from "react";

type IconName = "home" | "grid" | "book" | "store" | "users" | "user" | "search" | "menu" | "close" | "sun" | "moon" | "arrow" | "arrow-up-right" | "chevron" | "heart" | "bookmark" | "clock" | "eye" | "message" | "plus" | "check" | "check-circle" | "mail" | "phone" | "map" | "github" | "linkedin" | "globe" | "folder" | "briefcase" | "layers" | "chart" | "settings" | "bell" | "upload" | "external" | "filter" | "code" | "sparkles" | "send" | "loader" | "alert" | "info" | "calendar" | "download" | "database" | "laptop" | "shield-check";

const paths: Record<IconName, string> = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  grid: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  book: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5zm0 0V19a2.5 2.5 0 0 1 2.5-2.5H20",
  store: "M3 9h18l-1.5-6h-15zM5 9v12h14V9M9 21v-7h6v7",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9-7.8a4 4 0 0 1 0 7.6",
  user: "M20 21a8 8 0 0 0-16 0m8-10a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z",
  search: "m20 20-4.2-4.2M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M18 6 6 18",
  sun: "M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  moon: "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z",
  arrow: "M4 12h15m-6-6 6 6-6 6",
  "arrow-up-right": "M7 17 17 7M7 7h10v10",
  chevron: "m9 18 6-6-6-6",
  heart: "M20.8 8.8c0 5.2-8.8 10-8.8 10S3.2 14 3.2 8.8a4.5 4.5 0 0 1 8.8-1.4 4.5 4.5 0 0 1 8.8 1.4Z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  message: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.1a9 9 0 0 1-.9-4A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  "check-circle": "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  phone: "M5 3h14v18H5zM9 17h6",
  map: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  github: "M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7.1 0C5 1.2 3.8 1.6 3.8 1.6a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.1 6.4 6.1 6.7a3.4 3.4 0 0 0-.9 2.7V22",
  linkedin: "M4 9v11M4 4v.01M9 20v-7a4 4 0 0 1 8 0v7m0-11v11m-8-11v11",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z",
  folder: "M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  briefcase: "M3 7h18v13H3zM8 7V4h8v3m-13 5h18m-11 0v2h4v-2",
  layers: "m12 2 9 5-9 5-9-5zm-9 10 9 5 9-5m-18 5 9 5 9-5",
  chart: "M3 3v18h18M7 14l4-4 4 3 6-7",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
  upload: "M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4",
  external: "M14 3h7v7m-1-6-9 9M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
  filter: "M4 6h16M7 12h10m-7 6h4",
  code: "m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14",
  sparkles: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 2l.7 1.3L7 4l-1.3.7L5 6l-.7-1.3L3 4l1.3-.7L5 2Z",
  send: "m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13",
  loader: "M12 2a10 10 0 1 0 10 10",
  alert: "M12 9v4m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3l-7.9-14.1a2 2 0 0 0-3.4 0Z",
  info: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
  download: "M12 3v12m-5-5 5 5 5-5M4 19v2h16v-2",
  database: "M12 3c5 0 9 1.3 9 3s-4 3-9 3-9-1.3-9-3 4-3 9-3Zm-9 3v6c0 1.7 4 3 9 3s9-1.3 9-3V6m-18 6v6c0 1.7 4 3 9 3s9-1.3 9-3v-6",
  laptop: "M4 5h16v11H4zM2 19h20",
  "shield-check": "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-6",
};

export function Icon({ name, size = 18, className, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d={paths[name]} />
    </svg>
  );
}
