export type NavChild = { label: string; href: string };
export type NavSection = { label: string; href: string; children: NavChild[] };

// Single source of truth for the platform site map (docs/designs/flova_platform_site_map).
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "AI Studio",
    href: "/studio",
    children: [
      { label: "Video Gen", href: "/studio/video" },
      { label: "Character Studio", href: "/studio/character" },
      { label: "Style Studio", href: "/studio/style" },
      { label: "Canvas", href: "/studio/canvas" },
    ],
  },
  {
    label: "Management",
    href: "/manage",
    children: [
      { label: "Assets Hub", href: "/manage/assets" },
      { label: "Project Workspace", href: "/manage/projects" },
      { label: "Render", href: "/manage/render" },
    ],
  },
  {
    label: "Community",
    href: "/community",
    children: [
      { label: "Discovery Feed", href: "/community/feed" },
      { label: "Style Marketplace", href: "/community/marketplace" },
    ],
  },
  {
    label: "Account",
    href: "/account",
    children: [
      { label: "Profile", href: "/account/profile" },
      { label: "Team Billing", href: "/account/billing" },
      { label: "Settings", href: "/account/settings" },
    ],
  },
];
