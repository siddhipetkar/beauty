import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftRight, Search, ShoppingBag, X } from "lucide-react";
import { api, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Reveal } from "@/components/Reveal";

const FIELDS = [
  { key: "hex", label: "HEX", mono: true },
  { key: "family", label: "Family" },
  { key: "undertone", label: "Undertone" },
  { key: "finish", label: "Finish" },
  { key: "coverage", label: "Coverage" },
];

function ShadePicker({ label, selected, onSelect, exclude, testid }) {
  const [q, setQ] = useState("");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      api.get(`/shades${q ? `?q=${encodeURIComponent(q)}` : ""}`)
        .then((r) => setOptions(r.data.filter((s) => s.id !== exclude).slice(0, 12)))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [q, exclude]);

  if (selected) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white" data-testid={`${testid}-selected`}>
        <div className="h-32 sm:h-40" style={{ backgroundColor: selected.hex }} />
        <button
          data-testid={`${testid}-clear`}
          onClick={() => onSelect(null)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-accent shadow hover:bg-white"
          aria-label="Clear shade"
        >
          <X size={14} />
        </button>
        <div className="p-4">
          <p className="truncate font-serif text-lg font-bold text-accent">{selected.name}</p>
          <p className="truncate text-xs text-muted-foreground">{selected.product_name}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{selected.hex} Â· {inr(selected.price)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-pink-200 bg-white/70 p-5" data-testid={`${testid}-picker`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <div className="relative mt-3">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          data-testid={`${testid}-search`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any shade..."
          className="w-full rounded-full border border-pink-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((s) => (
          <button
            key={s.id}
            data-testid={`${testid}-option-${s.id}`}
            onClick={() => onSelect(s)}
            className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-white py-1 pl-1 pr-3 text-[11px] font-semibold text-foreground/70 transition-colors hover:border-primary hover:text-primary"
          >
            <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: s.hex }} />
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ShadeCompare() {
  const [params, setParams] = useSearchParams();
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const pa = params.get("a");
    const pb = params.get("b");
    if (pa) api.get(`/shades/${pa}`).then((r) => setA(r.data)).catch(() => {});
    if (pb) api.get(`/shades/${pb}`).then((r) => setB(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!a || !b) { setResult(null); return; }
    setLoading(true);
    setParams({ a: a.id, b: b.id }, { replace: true });
    api.get(`/compare?a=${a.id}&b=${b.id}`)
      .then((r) => setResult(r.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b]);

  const swap = () => { setA(b); setB(a); };

  const addShade = (s) => add(
    { id: s.product_id, name: s.product_name, type: s.type, image: s.image, price: s.price }, s);

  return (
    <div className="texture-grain min-h-[80vh] bg-rose-blush/60" data-testid="compare-page">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
        <Reveal className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Shade Compare</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
            Two shades. <span className="italic text-primary">One truth.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Pin any two shades from the wall side by side — we compute their redmean colour distance
            and tell you exactly how close they really are.
          </p>
        </Reveal>

        <div className="relative mt-10 grid gap-5 sm:grid-cols-2">
          <ShadePicker label="Shade A" selected={a} onSelect={setA} exclude={b?.id} testid="compare-a" />
          <ShadePicker label="Shade B" selected={b} onSelect={setB} exclude={a?.id} testid="compare-b" />
          {a && b && (
            <button
              data-testid="compare-swap"
              onClick={swap}
              className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-xl transition-transform hover:rotate-180"
              aria-label="Swap shades"
            >
              <ArrowLeftRight size={17} />
            </button>
          )}
        </div>

        {loading && <p className="mt-10 text-center font-mono text-xs uppercase tracking-widest text-primary">Computing colour distance...</p>}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
            data-testid="compare-result"
          >
            <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white">
              <div className="grid grid-cols-2">
                <div className="flex h-36 items-end p-5 sm:h-44" style={{ backgroundColor: result.a.hex }}>
                  <span className="rounded-full bg-white/90 px-3.5 py-1.5 font-serif text-sm font-bold text-accent">{result.a.name}</span>
                </div>
                <div className="flex h-36 items-end justify-end p-5 sm:h-44" style={{ backgroundColor: result.b.hex }}>
                  <span className="rounded-full bg-white/90 px-3.5 py-1.5 font-serif text-sm font-bold text-accent">{result.b.name}</span>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Colour similarity</p>
                    <p className="font-serif text-5xl font-bold text-accent" data-testid="similarity-score">{result.similarity}%</p>
                  </div>
                  <div className="max-w-xs">
                    <span className="rounded-full bg-rose-blush px-4 py-2 font-serif text-sm font-semibold italic text-primary" data-testid="compare-verdict">
                      "{result.verdict}"
                    </span>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      redmean distance {result.distance} Â· {result.same_family ? "same family" : "different families"} Â· {result.same_undertone ? "same undertone" : "different undertones"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-rose-blush">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.similarity}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>

                <div className="mt-8 overflow-hidden rounded-2xl border border-pink-100" data-testid="compare-table">
                  {FIELDS.map((f, i) => (
                    <div key={f.key} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-rose-blush/50" : "bg-white"}`}>
                      <p className={`px-4 py-3 text-right capitalize text-accent ${f.mono ? "font-mono text-xs" : "font-semibold"}`}>{result.a[f.key]}</p>
                      <p className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{f.label}</p>
                      <p className={`px-4 py-3 capitalize text-accent ${f.mono ? "font-mono text-xs" : "font-semibold"}`}>{result.b[f.key]}</p>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 bg-white text-sm">
                    <p className="px-4 py-3 text-right font-semibold text-accent">{inr(result.a.price)}</p>
                    <p className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price</p>
                    <p className="px-4 py-3 font-semibold text-accent">{inr(result.b.price)}</p>
                  </div>
                </div>

                {result.price_diff !== 0 && (
                  <p className="mt-4 text-center text-sm text-muted-foreground" data-testid="compare-savings">
                    {result.price_diff > 0
                      ? <><span className="font-bold text-green-700">{result.b.name}</span> saves you <span className="font-bold text-green-700">{inr(result.price_diff)}</span> for the same look</>
                      : <><span className="font-bold text-green-700">{result.a.name}</span> saves you <span className="font-bold text-green-700">{inr(-result.price_diff)}</span> for the same look</>}
                  </p>
                )}

                <div className="mt-4 text-center">
                  <button
                    data-testid="compare-dupe-shortcut"
                    onClick={() => navigate(`/dupe-finder?shade=${result.price_diff > 0 ? result.a.id : result.b.id}`)}
                    className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-accent"
                  >
                    Hunt even cheaper dupes of {result.price_diff > 0 ? result.a.name : result.b.name} â†’
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {[result.a, result.b].map((s) => (
                    <div key={s.id} className="flex gap-2">
                      <button
                        data-testid={`compare-add-${s.id}`}
                        onClick={() => addShade(s)}
                        disabled={s.stock === 0}
                        className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-primary disabled:opacity-40"
                      >
                        <ShoppingBag size={14} /> Add {s.name} — {inr(s.price)}
                      </button>
                      <button
                        data-testid={`compare-view-${s.id}`}
                        onClick={() => navigate(`/product/${s.product_id}`)}
                        className="rounded-full border border-pink-200 px-5 py-3 text-xs font-semibold text-accent hover:border-primary"
                      >
                        View
                      </button>
                      <button
                        data-testid={`compare-dupes-${s.id}`}
                        onClick={() => navigate(`/dupe-finder?shade=${s.id}`)}
                        className="rounded-full border border-primary/40 bg-rose-blush px-5 py-3 text-xs font-semibold text-primary hover:bg-primary hover:text-white"
                      >
                        Cheaper dupes
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
