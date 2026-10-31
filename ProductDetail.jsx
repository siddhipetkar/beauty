import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Star, BellRing, Copy } from "lucide-react";
import { toast } from "sonner";
import { api, inr, apiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [shade, setShade] = useState(null);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      const first = res.data.shades.find((s) => s.stock > 0) || res.data.shades[0];
      setShade(first);
    }).catch(() => setProduct(false));
  }, [id]);

  const off = useMemo(() => product && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0, [product]);

  if (product === null) return <div className="mx-auto max-w-7xl px-6 py-20"><div className="aspect-[4/5] max-w-md animate-pulse rounded-3xl bg-rose-wall" /></div>;
  if (product === false) return <p className="py-32 text-center text-muted-foreground" data-testid="product-not-found">Product not found.</p>;

  const outOfStock = shade && shade.stock === 0;

  const notifyRestock = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/restock-alerts", { product_id: product.id, shade_id: shade.id });
      toast.success("Restock alert set — we will notify you!");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    await api.post("/wishlist", { product_id: product.id });
    toast.success("Saved to your wishlist");
  };

  const submitReview = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post(`/products/${product.id}/reviews`, { rating, comment });
      toast.success("Review posted — thank you!");
      setComment("");
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="product-detail-page">
      <nav className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">Shop</Link> / <Link to={`/shop?category=${product.category}`} className="hover:text-primary">{product.category}</Link> / <span className="text-accent">{product.type}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-rose-wall lg:sticky lg:top-24 lg:self-start"
        >
          <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          {off > 0 && <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">{off}% OFF</span>}
          {shade && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full bg-white/90 py-2 pl-2 pr-5 shadow-lg backdrop-blur">
              <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: shade.hex }} />
              <div className="leading-tight">
                <p className="text-xs font-bold text-accent">{shade.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{shade.hex}</p>
              </div>
            </div>
          )}
        </motion.div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">{product.brand} Â· {product.type}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-accent" data-testid="product-name">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-rose-blush px-2.5 py-1 text-xs font-semibold text-accent">
              <Star size={12} className="fill-amber-400 text-amber-400" /> {product.rating}
            </span>
            <span className="text-xs text-muted-foreground">{product.reviews_count} reviews</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="font-serif text-3xl font-bold text-foreground" data-testid="product-price">{inr(product.price)}</p>
            {off > 0 && <p className="text-lg text-muted-foreground line-through">{inr(product.mrp)}</p>}
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">incl. GST</p>
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
                {product.shade_count} shades Â· <span className="text-primary">{shade?.name}</span>
              </p>
              <div className="flex items-center gap-4">
                <Link to={`/dupe-finder?shade=${shade?.id}`} data-testid="find-dupes-link" className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-accent">
                  Find dupes of {shade?.name}
                </Link>
                <Link to={`/compare?a=${shade?.id}`} data-testid="compare-shade-link" className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-accent">
                  Compare this shade
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5" data-testid="shade-selector">
              {product.shades.map((s) => (
                <button
                  key={s.id}
                  data-testid={`shade-option-${s.id}`}
                  onClick={() => setShade(s)}
                  title={`${s.name} ${s.hex}${s.stock === 0 ? " (out of stock)" : ""}`}
                  className={`swatch-ring relative h-10 w-10 rounded-full border-2 transition-all ${
                    shade?.id === s.id ? "scale-110 border-accent shadow-lg" : "border-black/10"
                  } ${s.stock === 0 ? "opacity-40" : ""}`}
                  style={{ backgroundColor: s.hex }}
                >
                  {s.stock === 0 && <span className="absolute inset-0 flex items-center justify-center text-white">Ã—</span>}
                </button>
              ))}
            </div>

            {shade && (
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-pink-100 bg-white p-4 font-mono text-[11px] sm:grid-cols-3" data-testid="shade-data-card">
                <div><p className="text-muted-foreground">HEX</p><p className="mt-0.5 font-semibold text-accent">{shade.hex}</p></div>
                <div><p className="text-muted-foreground">UNDERTONE</p><p className="mt-0.5 font-semibold capitalize text-accent">{shade.undertone}</p></div>
                <div><p className="text-muted-foreground">FAMILY</p><p className="mt-0.5 font-semibold text-accent">{shade.family}</p></div>
                <div><p className="text-muted-foreground">FINISH</p><p className="mt-0.5 font-semibold capitalize text-accent">{shade.finish}</p></div>
                <div><p className="text-muted-foreground">COVERAGE</p><p className="mt-0.5 font-semibold capitalize text-accent">{shade.coverage}</p></div>
                <div><p className="text-muted-foreground">SKIN TONES</p><p className="mt-0.5 font-semibold capitalize text-accent">{shade.tones.join(", ")}</p></div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-pink-200">
              <button data-testid="qty-minus" onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-accent"><Minus size={15} /></button>
              <span className="w-8 text-center text-sm font-bold" data-testid="qty-value">{qty}</span>
              <button data-testid="qty-plus" onClick={() => setQty(Math.min(10, qty + 1))} className="p-3 text-accent"><Plus size={15} /></button>
            </div>
            {outOfStock ? (
              <button
                data-testid="restock-notify-btn"
                onClick={notifyRestock}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <BellRing size={16} /> Notify me when back
              </button>
            ) : (
              <button
                data-testid="add-to-bag-btn"
                onClick={() => add(product, shade, qty)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent hover:shadow-xl hover:shadow-pink-200"
              >
                <ShoppingBag size={16} /> Add to Bag — {inr(product.price * qty)}
              </button>
            )}
            <button data-testid="wishlist-btn" onClick={toggleWishlist} className="rounded-full border border-pink-200 p-3.5 text-accent transition-colors hover:bg-rose-blush">
              <Heart size={17} />
            </button>
          </div>

          {shade && !outOfStock && shade.stock < 5 && (
            <p className="mt-3 text-xs font-semibold text-orange-600" data-testid="low-stock-note">Only {shade.stock} left in {shade.name} — order soon!</p>
          )}

          <div className="mt-10 border-t border-pink-100 pt-8">
            <h3 className="font-serif text-xl font-semibold text-accent">Reviews</h3>
            <div className="mt-4 space-y-4">
              {product.reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>}
              {product.reviews.map((r, i) => (
                <div key={i} className="rounded-2xl bg-rose-blush/70 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent">{r.user_name}</span>
                    <span className="flex">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={10} className="fill-amber-400 text-amber-400" />)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/80">{r.comment}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-pink-100 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Your rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} data-testid={`review-star-${n}`} onClick={() => setRating(n)}>
                    <Star size={16} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-pink-200"} />
                  </button>
                ))}
              </div>
              <textarea
                data-testid="review-input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your shade story..."
                className="mt-3 w-full rounded-xl border border-pink-100 p-3 text-sm outline-none focus:border-primary"
                rows={2}
              />
              <button data-testid="review-submit-btn" onClick={submitReview} className="mt-2 rounded-full bg-accent px-5 py-2 text-xs font-semibold text-white hover:bg-primary">
                Post review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
