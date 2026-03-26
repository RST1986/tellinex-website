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
  { to: "/contact", label: "Contact" },
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
    <div className="relative min-h-screen w-full" style={{ background: "#040d14" }}>
      <SpaceBackground />

      {/* ─── NAVBAR ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(4,13,20,0.75)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,199,177,0.12)",
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
                filter: "drop-shadow(0 0 10px rgba(0,199,177,0.35))",
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
                  style={{
                    fontFamily: '"Nunito", sans-serif',
                    fontSize: "0.82rem",
                    letterSpacing: "0.05em",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    color: active ? "#00C7B1" : "rgba(255,255,255,0.6)",
                    background: active ? "rgba(0,199,177,0.08)" : "transparent",
                    borderBottom: active ? "2px solid #00C7B1" : "2px solid transparent",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.6)";
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
              background: "#A3E635",
              color: "#040d14",
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderRadius: "5px",
              textDecoration: "none",
              boxShadow: "0 0 14px rgba(163,230,53,0.3)",
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
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none" }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              background: "rgba(4,13,20,0.95)",
              borderTop: "1px solid rgba(0,199,177,0.15)",
              padding: "16px",
            }}
          >
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                style={{
                  display: "block",
                  padding: "12px 16px",
                  fontFamily: '"Nunito", sans-serif',
                  fontSize: "0.95rem",
                  color: location.pathname === n.to ? "#00C7B1" : "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  borderRadius: "6px",
                  background: location.pathname === n.to ? "rgba(0,199,177,0.08)" : "transparent",
                }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/register"
              style={{
                display: "block",
                marginTop: "12px",
                padding: "12px",
                background: "#A3E635",
                color: "#040d14",
                fontFamily: '"Poppins", sans-serif',
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
          borderTop: "1px solid rgba(0,199,177,0.12)",
          background: "rgba(4,13,20,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img src="/Logo.svg" alt="Tellinex" style={{ height: "2.2rem", marginBottom: "12px", filter: "drop-shadow(0 0 8px rgba(0,199,177,0.3))" }} />
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                Hurricane-resilient fibre broadband for Jamaica. Underground. Unstoppable. Unlimited.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#00C7B1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Navigation</h4>
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  style={{ display: "block", fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "3px 0", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#00C7B1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Services</h4>
              {["Residential Fibre", "Business Fibre", "Enterprise Solutions", "Wholesale & Backhaul"].map((s) => (
                <Link
                  key={s}
                  to="/services"
                  style={{ display: "block", fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "3px 0", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                >
                  {s}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "0.8rem", color: "#00C7B1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Contact</h4>
              <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                info@tellinex.com<br />
                Kingston, Jamaica<br />
                tellinex.com
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(0,199,177,0.1)",
              paddingTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              © 2026 Tellinex Limited · Next-Gen Telecommunications
            </p>
            <div
              style={{
                height: "3px",
                width: "3rem",
                background: "linear-gradient(90deg, #00C7B1, #A3E635)",
                borderRadius: "2px",
                boxShadow: "0 0 8px rgba(163,230,53,0.4)",
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
