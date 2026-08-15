import { useEffect } from "react";
import { LEGAL_REVIEW_REQUIRED } from "../content/commercialFacts";

export function useDraftLegalRobots() {
  useEffect(() => {
    if (LEGAL_REVIEW_REQUIRED !== true) return;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute("content") ?? null;
    if (existing) {
      existing.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      meta.setAttribute("content", "noindex, nofollow");
      document.head.appendChild(meta);
    }
    return () => {
      const meta = document.querySelector('meta[name="robots"]');
      if (!meta) return;
      if (previous === null) meta.remove();
      else meta.setAttribute("content", previous);
    };
  }, []);
}
