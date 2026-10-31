import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api, inr } from "@/lib/api";
import { Reveal } from "@/components/Reveal";

const TONES = ["All", "fair", "light", "medium", "tan", "deep"];
const UNDERTONES = ["All", "warm", "cool", "neutral"];

export default function SwatchWall() {
  const [families, setFamilies] = useState([]);
  const [shades, setShades] = useState([]);
  const [total, setTotal] = useState(0);
  const [family, setFamily] = useState("All");
  const [undertone, setUndertone] = useState("All");
  const [tone, setTone] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/shade-families").then((res) => setFamilies(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (family !== "All") params.set("family", family);
    if (undertone !== "All") params.set("undertone", undertone);
    if (tone !== "All") params.set("tone", tone);
    if (q) params.set("q", q);
    api.get(`/shades?${params.toString()}`)
      .then((res) => { setShades(res.data); setTotal(res.data.length); })
      .finally(() => setLoading(false));
  }, [family, undertone, tone, q]);

  return (
    <div className="bg-rose-wall/50" data-testid="swatch-wall-page">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Colour as Data</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">The Swatch Wall</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            All 209 shades, each carrying its hex code, undertone and skin-tone map. Filter by colour family and hover for the data.
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center gap-2" data-testid="family-filters">
          {[{ family: "All", count: null }, ...families].map((f) => (
            <button
              key={f.family}
              data-testid={`family-${f.family.toLowerCase()}`}
              onClick={() => setFamily(f.family)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                family === f.family ? "border-accent bg-accent text-white" : "border-pink-200 bg-white text-foreground/60 hover:text-primary"
              }`}
            >
              {f.family}{f.count ? ` Â· ${f.count}` : ""}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select data-testid="tone-filter" value={tone} onChange={(e) => setTone(e.target.value)}
            className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold capitalize text-foreground/70 outline-none">
            {TONES.map((t) => <option key={t} value={t}>{t === "All" ? "All skin tones" : t}</option>)}
          </select>
          <select data-testid="undertone-filter" value={undertone} onChange={(e) => setUndertone(e.target.value)}
            className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold capitalize text-foreground/70 outline-none">
            {UNDERTONES.map((u) => <option key={u} value={u}>{u === "All" ? "All undertones" : u}</option>)}
          </select>
          <input
            data-testid="swatch-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a shade name..."
            className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs outline-none focus:border-primary"
          />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground" data-testid="swatch-count">
            {total} shades on the wall
          </span>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-10">
            {Array.from({ length: 30 }).map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-xl bg-pink-100" />)}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-10" data-testid="swatch-grid">
            {shades.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.35, delay: (i % 10) * 0.03 }}
              >
                <Link
                  to={`/product/${s.product_id}`}
                  data-testid={`swatch-${s.id}`}
                  className="group block"
                  title={`${s.name} — ${s.product_name}`}
                >
                  <div
                    className="swatch-ring relative aspect-square overflow-hidden rounded-xl border border-black/5"
                    style={{ backgroundColor: s.hex }}
                  >
                    {s.stock === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 font-mono text-[8px] uppercase tracking-widest text-white">sold out</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 px-1.5 py-1.5 transition-transform duration-300 group-hover:translate-y-0">
                      <p className="truncate text-[9px] font-bold leading-tight text-accent">{s.name}</p>
                      <p className="font-mono text-[8px] text-muted-foreground">{s.hex}</p>
                    </div>
                  </div>
                  <p className="mt-1.5 truncate text-[10px] font-semibold text-foreground/70">{s.name}</p>
                  <p className="truncate text-[9px] text-muted-foreground">{s.product_name} Â· {inr(s.price)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
