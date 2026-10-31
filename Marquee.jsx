import { Sparkles } from "lucide-react";

const ITEMS = [
  "Free delivery over ₹999", "209 shades as data", "Shade Finder quiz",
  "Dupe Finder — same colour, lower price", "Loyalty points on every order",
  "New: RosÃ© Reverie Palette", "COD Â· UPI Â· Card accepted",
];

export const Marquee = () => {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-pink-100 bg-rose-blush py-3" data-testid="marquee">
      <div className="animate-marquee flex w-max items-center gap-8">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap font-mono text-xs uppercase tracking-[0.22em] text-accent">
            {item} <Sparkles size={12} className="text-primary" />
          </span>
        ))}
      </div>
    </div>
  );
};
