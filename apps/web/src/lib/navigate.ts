import { beginInstantNav } from "@/components/navigation/InstantNav";

/** Soft navigation preferred — hard reloads over tunnels feel stuck loading. */
export function isAtlasMobileWebView(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & { ReactNativeWebView?: unknown };
  return Boolean(w.ReactNativeWebView) || /AtlasMobile/i.test(navigator.userAgent);
}

export function appNavigate(href: string) {
  if (typeof window === "undefined") return;
  window.location.assign(href);
}

/** Always prefer soft Next.js navigation when available. */
export function appNavigateSoftOrHard(
  href: string,
  softNavigate?: (href: string) => void,
) {
  beginInstantNav(href);
  if (softNavigate) {
    softNavigate(href);
    return;
  }
  appNavigate(href);
}
