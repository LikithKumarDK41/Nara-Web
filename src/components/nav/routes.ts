import type { ComponentType, SVGProps } from "react";
import { List, BookmarkCheck, FileLock2, VideoIcon, Map, Search } from "lucide-react";

/** Discriminated union: link items vs. action items */
export type NavLinkItem = {
  type: "link";
  href: string;
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isVideo?: boolean; // ✅ add this
};

export type NavActionItem = {
  type: "action";
  action: "logout" | "search";
  labelKey: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type NavItem = NavLinkItem | NavActionItem;

export const NAV_ITEMS: NavItem[] = [
  // { type: "link", href: "/", labelKey: "nav.home", icon: Home },
  { type: "link", href: "/tours", labelKey: "nav.tours", icon: List },
  { type: "link", href: "/mylist", labelKey: "nav.myList", icon: BookmarkCheck },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { type: "link", href: "/tours", labelKey: "nav.tours", icon: List },
  { type: "link", href: "/mylist", labelKey: "nav.myList", icon: BookmarkCheck },
  // { type: "link", href: "/map", labelKey: "nav.map", icon: Map },
  // { type: "action", action: "search", labelKey: "nav.search", icon: Search },
  {
    type: "link",
    href: "https://naraiseki.nichi.in/public-videos/",
    // href: "https://api.gose.nichi.in/public-videos/",
    labelKey: "nav.videos",
    icon: VideoIcon,
    isVideo: true, // ✅ explicit
  },
  // { type: "link", href: "/privacy-policy", labelKey: "nav.privacy_policy", icon: FileLock2 },
];

/** active matcher only for links */
export function isActivePath(pathname: string, item: NavItem) {
  if (item.type !== "link") return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

/** title for current route */
export function currentSectionTitle(pathname: string) {
  const found = NAV_ITEMS.find(
    (n) => n.type === "link" && isActivePath(pathname, n)
  ) as NavLinkItem | undefined;
  return found?.labelKey ?? "Tourist";
}
