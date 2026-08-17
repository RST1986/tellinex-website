import { useEffect } from "react";

/**
 * If GSAP never runs, content must remain visible.
 * prefers-reduced-motion skips entrance animation entirely.
 */
export function useRevealSafe(selector = ".reveal-safe"): void {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = () => {
      for (const node of nodes) {
        node.style.opacity = "1";
        node.style.transform = "none";
        node.style.filter = "none";
      }
    };

    if (reduced) {
      show();
      return;
    }

    const timer = window.setTimeout(show, 1800);
    return () => window.clearTimeout(timer);
  }, [selector]);
}
