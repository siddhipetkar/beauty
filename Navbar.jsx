import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/swatch-wall", label: "Swatch Wall" },
  { to: "/shade-finder", label: "Shade Finder" },
  { to: "/dupe-finder", label: "Dupe Finder" },
  { to: "/compare", label: "Compare" },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-pink-100/70" data-testid="navbar">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" data-testid="nav-home-link">
          <Logo />
          <span className="leading-none">
            <span className="block font-serif text-lg font-bold tracking-tight text-accent">AuraCart</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-primary">Lumière Beauty</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" data-testid="nav-links">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(" ", "-")}-link`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-foreground/70"}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            data-testid="nav-wishlist-btn"
            onClick={() => navigate(user ? "/account?tab=wishlist" : "/login")}
            className="hidden rounded-full p-2.5 text-foreground/70 transition-colors hover:bg-rose-blush hover:text-primary sm:block"
          >
            <Heart size={19} />
          </button>
          <button
            data-testid="nav-cart-btn"
            onClick={() => navigate("/cart")}
            className="relative rounded-full p-2.5 text-foreground/70 transition-colors hover:bg-rose-blush hover:text-primary"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span data-testid="nav-cart-count" className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="nav-account-btn" className="flex items-center gap-2 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]">
                  <User size={14} /> <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="nav-account-link" onClick={() => navigate("/account")}>
                  <User size={14} className="mr-2" /> My Account
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem data-testid="nav-admin-link" onClick={() => navigate("/admin")}>
                    <LayoutDashboard size={14} className="mr-2" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem data-testid="nav-logout-btn" onClick={async () => { await logout(); navigate("/"); }}>
                  <LogOut size={14} className="mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              data-testid="nav-login-btn"
              onClick={() => navigate("/login")}
              className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Sign In
            </button>
          )}
          <button data-testid="nav-menu-btn" className="rounded-full p-2 lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-pink-100 bg-white/95 px-6 py-4 lg:hidden" data-testid="nav-mobile-menu">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 font-serif text-lg text-foreground/80"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};
