import { Link, useRouterState } from "@tanstack/react-router";
import "./site-footer.css";

const NO_FOOTER_PREFIXES = ["/", "/dashboard", "/staff", "/auth", "/demo"];

export function SiteFooter({ force = false }: { force?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!force && NO_FOOTER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">By Appointment Only</div>
        <div className="footer-addr">16 Paws Street, Barking, Greater London</div>
        <nav className="footer-legal" aria-label="Legal">
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/no-show-policy">No-Show Policy</Link>
          <Link to="/cookies-policy">Cookies Policy</Link>
          <Link to="/why-baowow">Why BAOWOW?</Link>
          <Link to="/dashboard">Login</Link>
        </nav>
        <p className="footer-disclaimer">
          This is a prototype of BAOWOW, an application prototype for automated appointment-based
          businesses developed by{" "}
          <a href="https://protocell.io" target="_blank" rel="noopener noreferrer">
            PROTOCELL IO
          </a>
          , intended for demonstration purposes only.
        </p>
        <div className="footer-copy">
          © {new Date().getFullYear()} By Appointment Only. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
