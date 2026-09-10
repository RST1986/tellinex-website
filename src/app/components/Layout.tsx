import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import SpaceBackground from "./SpaceBackground";
import AIChatWidget from "./AIChatWidget";
import { Button } from "./ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/register", label: "Register Interest" },
  { to: "/availability", label: "Availability" },
  { to: "/status", label: "Status" },
  { to: "/contact", label: "Contact" },
  { to: "/reviews", label: "Reviews" },
];

const FOOTER_HEADING_CLASS = "mb-3 [font-family:var(--tlx-font-display)] text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[var(--tlx-primary)]";
const FOOTER_LINK_CLASS = "block py-[3px] [font-family:var(--tlx-font-sans)] text-[0.8rem] text-[var(--tlx-text-soft)] no-underline transition-colors hover:text-[var(--tlx-text)]";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change + scroll to top
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full bg-[var(--tlx-bg)]">
      <SpaceBackground />

      {/* ─── NAVBAR ─── */}
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--tlx-border)] bg-[var(--tlx-bg-nav)] [backdrop-filter:blur(16px)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/Logo.svg"
              alt="Tellinex"
              className="h-[clamp(2rem,4vw,2.8rem)]"
              style={{ filter: "drop-shadow(0 0 10px var(--tlx-glow-primary))" }}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-[4px] border-b-2 px-[14px] py-[6px] [font-family:var(--tlx-font-sans)] text-[0.82rem] tracking-[0.05em] no-underline transition-all ${
                    active
                      ? "border-[var(--tlx-primary)] bg-[var(--tlx-surface-2)] text-[var(--tlx-primary)]"
                      : "border-transparent text-[var(--tlx-text-muted)] hover:text-[var(--tlx-text)]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* CTA button desktop */}
          <Link
            to="/register"
            className="hidden rounded-[5px] bg-[var(--tlx-accent)] px-5 py-2 [font-family:var(--tlx-font-display)] text-xs font-bold uppercase tracking-[0.1em] text-[var(--tlx-primary-contrast)] no-underline shadow-[0_0_14px_var(--tlx-glow-accent)] transition-[transform,box-shadow] md:block"
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, { scale: 1.05, boxShadow: "0 0 24px rgba(163,230,53,0.5)", duration: 0.2 });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, { scale: 1, boxShadow: "0 0 14px rgba(163,230,53,0.3)", duration: 0.2 });
            }}
          >
            Get Connected
          </Link>

          {/* Mobile hamburger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden text-[var(--tlx-text)] hover:bg-transparent hover:text-[var(--tlx-text)]"
            aria-label={menuOpen ? "Close primary navigation" : "Open primary navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-primary-navigation"
            className="border-t border-[var(--tlx-border-medium)] bg-[var(--tlx-bg-overlay)] p-4 md:hidden"
          >
            {NAV.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-[6px] px-4 py-3 [font-family:var(--tlx-font-sans)] text-[0.95rem] no-underline ${
                    active
                      ? "bg-[var(--tlx-surface-2)] text-[var(--tlx-primary)]"
                      : "text-[var(--tlx-text-emphasis-muted)]"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              className="mt-3 block rounded-[6px] bg-[var(--tlx-accent)] p-3 text-center [font-family:var(--tlx-font-display)] text-[0.85rem] font-bold text-[var(--tlx-primary-contrast)] no-underline"
            >
              GET CONNECTED
            </Link>
          </div>
        )}
      </nav>

      {/* ─── PAGE CONTENT ─── */}
      <main className="relative z-10 pt-16">
        <Outlet />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-[var(--tlx-border)] bg-[var(--tlx-bg-elevated)] [backdrop-filter:blur(12px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img
                src="/Logo.svg"
                alt="Tellinex"
                className="mb-3 h-[2.2rem]"
                style={{ filter: "drop-shadow(0 0 8px var(--tlx-glow-primary-soft))" }}
              />
              <p className="[font-family:var(--tlx-font-sans)] text-[0.8rem] leading-[1.6] text-[var(--tlx-text-faint)]">
                Building resilient digital infrastructure in Jamaica. Network design principle: underground-first fibre. Not a live national service.
              </p>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer navigation">
              <h4 className={FOOTER_HEADING_CLASS}>Navigation</h4>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={location.pathname === n.to ? "page" : undefined}
                  className={FOOTER_LINK_CLASS}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Services */}
            <div>
              <h4 className={FOOTER_HEADING_CLASS}>Services</h4>
              {["Residential Fibre", "Business Fibre", "Enterprise Solutions", "Wholesale & Backhaul"].map((s) => (
                <Link key={s} to="/services" className={FOOTER_LINK_CLASS}>
                  {s}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 className={FOOTER_HEADING_CLASS}>Contact</h4>
              <p className="[font-family:var(--tlx-font-sans)] text-[0.8rem] leading-[1.8] text-[var(--tlx-text-soft)]">
                info@tellinex.com<br />
                Kingston, Jamaica<br />
                tellinex.com
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--tlx-border-soft)] pt-5">
            <p className="[font-family:var(--tlx-font-sans)] text-[0.65rem] uppercase tracking-[0.12em] text-[var(--tlx-text-ghost)]">
              © 2026 Tellinex Limited · BUILDING_NETWORK
            </p>
            <div className="flex gap-4">
              <Link to="/privacy" className="[font-family:var(--tlx-font-sans)] text-xs text-[var(--tlx-text-caption)] no-underline">Privacy (draft)</Link>
              <Link to="/terms" className="[font-family:var(--tlx-font-sans)] text-xs text-[var(--tlx-text-caption)] no-underline">Terms (draft)</Link>
            </div>
            <div
              style={{
                height: "3px",
                width: "3rem",
                background: "linear-gradient(90deg, var(--tlx-primary), var(--tlx-accent))",
                borderRadius: "2px",
                boxShadow: "0 0 8px var(--tlx-glow-accent-soft)",
              }}
            />
          </div>
        </div>
      </footer>

      {/* ─── AI CHAT WIDGET ─── */}
      <AIChatWidget />
    </div>
  );
}
