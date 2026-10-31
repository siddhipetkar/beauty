import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export const ProductCard = ({ product, index = 0 }) => {
  const { add } = useCart();
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`} className="block" data-testid={`product-link-${product.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-rose-wall">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-white">
              {off}% OFF
            </span>
          )}
          {product.tags?.includes("bestseller") && (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-accent">
              Bestseller
            </span>
          )}
          <button
            data-testid={`quick-add-${product.id}`}
            onClick={(e) => {
              e.preventDefault();
              add(product, {
                id: product.default_shade_id,
                name: product.default_shade_name || "Signature shade",
                hex: product.default_shade_hex || product.shade_preview?.[0] || "#D94678",
              });
            }}
            className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-accent opacity-0 shadow-lg transition-all duration-300 hover:bg-accent hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
            aria-label="Quick add to bag"
          >
            <Plus size={18} />
          </button>
        </div>
      </Link>
      <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{product.type}</p>
          <Link to={`/product/${product.id}`} className="mt-0.5 block font-serif text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {product.name}
          </Link>
          <div className="mt-1.5 flex items-center gap-1.5">
            {(product.shade_preview || []).map((hex, i) => (
              <span key={i} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
            ))}
            <span className="ml-1 text-[10px] text-muted-foreground">{product.shade_count} shades</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-accent">{inr(product.price)}</p>
          {off > 0 && <p className="text-[11px] text-muted-foreground line-through">{inr(product.mrp)}</p>}
          <p className="mt-0.5 flex items-center justify-end gap-0.5 text-[11px] text-muted-foreground">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {product.rating}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
