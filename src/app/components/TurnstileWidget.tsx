import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import { TURNSTILE_SITE_KEY } from "../lib/publicForms";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "always";
      theme: "dark";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  reset: () => void;
};

type TurnstileWidgetProps = {
  action: string;
  onTokenChange: (token: string | null) => void;
  onUnavailable?: () => void;
};

const SCRIPT_ID = "cloudflare-turnstile-api";
let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile_script_failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile_script_failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

const containerStyle: CSSProperties = {
  minHeight: "65px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "16px",
};

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ action, onTokenChange, onUnavailable }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
          onTokenChange(null);
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;
      onTokenChange(null);

      void loadTurnstile()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            action,
            appearance: "always",
            theme: "dark",
            callback: (token) => onTokenChange(token),
            "expired-callback": () => onTokenChange(null),
            "error-callback": () => {
              onTokenChange(null);
              onUnavailable?.();
            },
          });
        })
        .catch(() => {
          if (!cancelled) {
            onTokenChange(null);
            onUnavailable?.();
          }
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [action, onTokenChange, onUnavailable]);

    return (
      <div style={containerStyle}>
        <div ref={containerRef} aria-label="Security verification" />
      </div>
    );
  },
);

export default TurnstileWidget;
