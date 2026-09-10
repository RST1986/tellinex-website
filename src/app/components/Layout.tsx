import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import SpaceBackground from "./SpaceBackground";
import AIChatWidget from "./AIChatWidget";

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

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change + scroll to top
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen w-full" style={{ background: "var(--tlx-bg)" }}>
      <SpaceBackground />

      {/* ─── NAVBAR ─── */}
      <nav
        aria-label="Primary"
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "var(--tlx-bg-nav)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--tlx-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/Logo.svg"
              alt="Tellinex"
              style={{
                height: "clamp(2rem, 4vw, 2.8rem)",
                filter: "drop-shadow(0 0 10px var(--tlx-glow-primary))",
              }}
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
                  style={{
                    fontFamily: "var(--tlx-font-sans)",
                    fontSize: "0.82rem",
                    letterSpacing: "0.05em",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    color: active ? "var(--tlx-primary)" : "var(--tlx-text-muted)",
                    background: active ? "var(--tlx-surface-2)" : "transparent",
                    borderBottom: active ? "2px solid var(--tlx-primary)" : "2px solid transparent",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "var(--tlx-text)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "var(--tlx-text-muted)";
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>

          {/* CTA button desktop */}
          <Link
            to="/register"
            className="hidden md:block"
            style={{
              padding: "8px 20px",
              background: "var(--tlx-accent)",
              color: "var(--tlx-primary-contrast)",
              fontFamily: "var(--tlx-font-display)",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: "5px",
              textDecoration: "none",
              boxShadow: "0 0 14px var(--tlx-glow-accent)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
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
          <button
            type="button"
            className="md:hidden text-white"
            aria-label={menuOpen ? "Close primary navigation" : "Open primary navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none" }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-primary-navigation"
            className="md:hidden"
            style={{
              background: "var(--tlx-bg-overlay)",
              borderTop: "1px solid var(--tlx-border-medium)",
              padding: "16px",
            }}
          >
            {NAV.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    fontFamily: "var(--tlx-font-sans)",
                    fontSize: "0.95rem",
                    color: active ? "var(--tlx-primary)" : "var(--tlx-text-emphasis-muted)",
                    textDecoration: "none",
                    borderRadius: "6px",
                    background: active ? "var(--tlx-surface-2)" : "transparent",
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
            <Link
              to="/register"
              style={{
                display: "block",
                marginTop: "12px",
                padding: "12px",
                background: "var(--tlx-accent)",
                color: "var(--tlx-primary-contrast)",
                fontFamily: "var(--tlx-font-display)",
                fontWeight: 700,
                fontSize: "0.85rem",
                textAlign: "center",
                borderRadius: "6px",
                textDecoration: "none",
              }}
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
      <footer
        className="relative z-10"
        style={{
          borderTop: "1px solid var(--tlx-border)",
          background: "var(--tlx-bg-elevated)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img src="/Logo.svg" alt="Tellinex" style={{ height: "2.2rem", marginBottom: "12px", filter: "drop-shadow(0 0 8px var(--tlx-glow-primary-soft))" }} />
              <p style={{ fontFamily: "var(--tlx-font-sans)", fontSize: "0.8rem", color: "var(--tlx-text-faint)", lineHeight: 1.6 }}>
                Building resilient digital infrastructure in Jamaica. Network design principle: underground-first fibre. Not a live national service.
              </p>
            </div>

            {/* Quick links */}
            <nav aria-label="Footer navigation">
              <h4 style={{ fontFamily: "var(--tlx-font-display)", fontWeight: 600, fontSize: "0.8rem", color: "var(--tlx-primary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Navigation</h4>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  aria-current={location.pathname === n.to ? "page" : undefined}
                  style={{ display: "block", fontFamily: "var(--tlx-font-sans)", fontSize: "0.8rem", color: "var(--tlx-text-soft)", textDecoration: "none", padding: "3px 0", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--tlx-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--tlx-text-soft)")}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            {/* Services */}
            <div>
              <h4 style={{ fontFamily: "var(--tlx-font-display)", fontWeight: 600, fontSize: "0.8rem", color: "var(--tlx-primary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Services</h4>
              {["Residential Fibre", "Business Fibre", "Enterprise Solutions", "Wholesale & Backhaul"].map((s) => (
                <Link
                  key={s}
                  to="/services"
                  style={{ display: "block", fontFamily: "var(--tlx-font-sans)", fontSize: "0.8rem", color: "var(--tlx-text-soft)", textDecoration: "none", padding: "3px 0", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--tlx-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--tlx-text-soft)")}
                >
                  {s}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: "var(--tlx-font-display)", fontWeight: 600, fontSize: "0.8rem", color: "var(--tlx-primary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Contact</h4>
              <p style={{ fontFamily: "var(--tlx-font-sans)", fontSize: "0.8rem", color: "var(--tlx-text-soft)", lineHeight: 1.8 }}>
                info@tellinex.com<br />
                Kingston, Jamaica<br />
                tellinex.com
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid var(--tlx-border-soft)",
              paddingTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <p style={{ fontFamily: "var(--tlx-font-sans)", fontSize: "0.65rem", color: "var(--tlx-text-ghost)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              © 2026 Tellinex Limited · BUILDING_NETWORK
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link to="/privacy" style={{ fontFamily: "var(--tlx-font-sans)", fontSize: "0.75rem", color: "var(--tlx-text-caption)", textDecoration: "none" }}>Privacy (draft)</Link>
              <Link to="/terms" style={{ fontFamily: "var(--tlx-font-sans)", fontSize: "0.75rem", color: "var(--tlx-text-caption)", textDecoration: "none" }}>Terms (draft)</Link>
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
