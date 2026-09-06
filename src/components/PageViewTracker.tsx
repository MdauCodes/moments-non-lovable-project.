import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/services/pageJourneyTracker";

/**
 * Fires the page-journey beacon on every in-app navigation — mounted once at the router root
 * (see App.tsx), same placement as ScrollToTop, which this otherwise mirrors (pathname-only
 * dependency: a hash-only navigation, e.g. a legal-page anchor, isn't a new page view).
 *
 * Admin routes are excluded: this report exists to understand *visitor* behavior for storefront
 * refinement, not to log an admin's own clicks around their own dashboard.
 */
export function PageViewTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
