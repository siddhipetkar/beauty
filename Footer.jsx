import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-pink-100 bg-accent text-white" data-testid="footer">
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-none">
            <p className="font-serif text-xl font-bold">AuraCart</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-pink-200">Lumière Beauty</p>
          </div>
        </div>
        <p className="mt-4 max-w-xs text-sm text-pink-100/80">
          More than a shop — a smarter way to find your perfect shade. Colour treated as data, beauty made personal.
        </p>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink-200">Shop</p>
        <ul className="mt-4 space-y-2 text-sm text-pink-100/90">
          <li><Link to="/shop?category=Lips" className="hover:text-white">Lips</Link></li>
          <li><Link to="/shop?category=Face" className="hover:text-white">Face</Link></li>
          <li><Link to="/shop?category=Eyes" className="hover:text-white">Eyes</Link></li>
          <li><Link to="/swatch-wall" className="hover:text-white">Swatch Wall</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink-200">Smart Tools</p>
        <ul className="mt-4 space-y-2 text-sm text-pink-100/90">
          <li><Link to="/shade-finder" className="hover:text-white">Shade Finder</Link></li>
          <li><Link to="/dupe-finder" className="hover:text-white">Dupe Finder</Link></li>
          <li><Link to="/account" className="hover:text-white">Loyalty Points</Link></li>
          <li><Link to="/account?tab=orders" className="hover:text-white">Track Order</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-pink-200">Project</p>
        <ul className="mt-4 space-y-2 text-sm text-pink-100/90">
          <li>Group 16 Â· Dept. of IT</li>
          <li>Guide: Mandar Ganjapurkar</li>
          <li>Tanvi Â· Siddhi Â· Vedanti</li>
          <li><a href="/api/docs" target="_blank" rel="noreferrer" className="underline decoration-pink-300 underline-offset-4 hover:text-white" data-testid="footer-swagger-link">Swagger API Docs</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-pink-200/70">
      AuraCart Â· Lumière Beauty — find your perfect shade
    </div>
  </footer>
);
