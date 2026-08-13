/** Full-page navigation is more reliable inside the mobile WebView + tunnels. */
export function isAtlasMobileWebView(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & { ReactNativeWebView?: unknown };
  return Boolean(w.ReactNativeWebView) || /AtlasMobile/i.test(navigator.userAgent);
}

export function appNavigate(href: string) {
  if (typeof window === "undefined") return;
  window.location.assign(href);
}

/** Prefer hard nav on mobile WebView; otherwise use the provided soft nav. */
export function appNavigateSoftOrHard(
  href: string,
  softNavigate?: (href: string) => void,
) {
  if (isAtlasMobileWebView() || !softNavigate) {
    appNavigate(href);
    return;
  }
  softNavigate(href);
}
