import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import { api, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Reveal } from "@/components/Reveal";

export default function DupeFinder() {
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const pre = params.get("shade");
    if (pre) findDupes(pre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get(`/shades${q ? `?q=${encodeURIComponent(q)}` : ""}`)
        .then((res) => setSuggestions(res.data.slice(0, 24)))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const findDupes = async (shadeId) => {
    setLoading(true);
    try {
      const res = await api.get(`/shades/${shadeId}/dupes`);
      setResult(res.data);
    } finally {
      setLoading(false);
    }
  };

  const original = result?.original;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8" data-testid="dupe-finder-page">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Dupe Finder</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
          Same colour. Kinder price.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Pick any shade on the wall. We compute redmean colour distance across all 209 shades and
          surface the closest matches — cheaper alternatives first, with exact savings in ₹.
        </p>
      </Reveal>

      <div className="mt-8 max-w-lg">
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="dupe-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a shade — try "Rosewood" or "Fearless Red"..."
            className="w-full rounded-full border border-pink-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2" data-testid="dupe-suggestions">
          {suggestions.map((s) => (
            <button
              key={s.id}
              data-testid={`dupe-pick-${s.id}`}
              onClick={() => findDupes(s.id)}
              className="flex items-center gap-2 rounded-full border border-pink-200 bg-white py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-foreground/70 transition-colors hover:border-primary hover:text-primary"
            >
              <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: s.hex }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mt-12 font-mono text-xs uppercase tracking-widest text-primary">Computing colour distances...</p>}

      {result && original && !loading && (
        <div className="mt-12" data-testid="dupe-results">
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4">
              <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white">
                <div className="h-40" style={{ backgroundColor: original.hex }} />
                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your pick</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-accent" data-testid="dupe-original-name">{original.name}</h3>
                  <p className="text-sm text-muted-foreground">{original.product_name} Â· {original.type}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-serif text-2xl font-bold text-foreground">{inr(original.price)}</p>
                    <p className="font-mono text-xs text-muted-foreground">{original.hex}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                {result.dupes.length} closest shades on the wall
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2" data-testid="dupe-list">
                {result.dupes.map((d, i) => (
                  <motion.div
                    key={d.shade.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-100"
                    data-testid={`dupe-card-${d.shade.id}`}
                  >
                    <button onClick={() => navigate(`/product/${d.shade.product_id}`)} className="relative shrink-0">
                      <span className="block h-16 w-16 rounded-2xl border border-black/10" style={{ backgroundColor: d.shade.hex }} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-serif text-base font-bold text-accent">{d.shade.name}</p>
                        <span className="rounded-full bg-rose-blush px-2 py-0.5 font-mono text-[10px] font-bold text-primary">{d.similarity}% match</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{d.shade.product_name}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-sm">
                        <span className="font-bold text-foreground">{inr(d.shade.price)}</span>
                        {d.cheaper ? (
                          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            Save {inr(d.savings)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">{d.savings === 0 ? "Same price" : `+${inr(-d.savings)}`}</span>
                        )}
                      </div>
                    </div>
                    <button
                      data-testid={`dupe-add-${d.shade.id}`}
                      onClick={() => add({ id: d.shade.product_id, name: d.shade.product_name, type: d.shade.type, image: d.shade.image, price: d.shade.price }, d.shade)}
                      className="shrink-0 rounded-full bg-accent p-2.5 text-white transition-transform hover:scale-110"
                      aria-label="Add dupe to bag"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
              {result.dupes.length === 0 && (
                <p className="mt-6 text-sm text-muted-foreground">No close shades found — this colour is truly one of a kind.</p>
              )}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-5 w-5 rounded-md" style={{ backgroundColor: original.hex }} />
            <ArrowRight size={12} />
            <span>sorted by colour distance, then savings</span>
          </div>
        </div>
      )}
    </div>
  );
}
