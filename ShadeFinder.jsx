import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, RotateCcw, ShoppingBag, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { api, inr, apiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Reveal } from "@/components/Reveal";

const TONE_OPTIONS = [
  { key: "fair", label: "Fair", hex: "#F2DFD3", hint: "Porcelain, burns easily" },
  { key: "light", label: "Light", hex: "#E7C9AC", hint: "Light beige, tans slowly" },
  { key: "medium", label: "Medium", hex: "#D2A275", hint: "Golden beige, tans well" },
  { key: "tan", label: "Tan", hex: "#AE7748", hint: "Caramel, rarely burns" },
  { key: "deep", label: "Deep", hex: "#6B4226", hint: "Rich espresso, never burns" },
];

const UNDERTONE_OPTIONS = [
  { key: "warm", label: "Warm", hint: "Gold jewellery suits you; veins look greenish" },
  { key: "cool", label: "Cool", hint: "Silver suits you; veins look bluish" },
  { key: "neutral", label: "Neutral", hint: "Both metals work; veins are hard to tell" },
  { key: "olive", label: "Olive", hint: "A subtle green cast to your skin" },
];

const CATS = ["All", "Lips", "Face", "Eyes"];
const TONE_HEX = Object.fromEntries(TONE_OPTIONS.map((t) => [t.key, t.hex]));

export default function ShadeFinder() {
  const [mode, setMode] = useState("quiz");
  const [step, setStep] = useState(0);
  const [tone, setTone] = useState(null);
  const [undertone, setUndertone] = useState(null);
  const [category, setCategory] = useState("All");
  const [results, setResults] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);
  const { add } = useCart();
  const navigate = useNavigate();

  const runMatch = async (cat) => {
    setLoading(true);
    try {
      const res = await api.post("/shade-finder/match", { tone, undertone, category: cat });
      setResults(res.data);
      setAnalysis(null);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const runSelfie = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/shade-finder/selfie", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
      setAnalysis(res.data.analysis);
      setStep(3);
    } catch (e) {
      toast.error(apiError(e, "Could not analyse that photo"));
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setTone(null); setUndertone(null); setCategory("All");
    setResults(null); setAnalysis(null); setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="texture-grain min-h-[80vh] bg-rose-blush/60" data-testid="shade-finder-page">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-8">
        <Reveal className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Shade Finder</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
            Your skin is the data
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Answer two questions — or let our AI read a selfie. Either way, we score every one of the
            209 shades against your skin tone and undertone.
          </p>
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-md rounded-full border border-pink-200 bg-white p-1" data-testid="finder-mode-toggle">
          {[
            { key: "quiz", label: "Quick Quiz" },
            { key: "selfie", label: "AI Selfie Scan" },
          ].map((m) => (
            <button
              key={m.key}
              data-testid={`mode-${m.key}`}
              onClick={() => { setMode(m.key); reset(); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition-colors ${
                mode === m.key ? "bg-accent text-white" : "text-foreground/60 hover:text-primary"
              }`}
            >
              {m.key === "selfie" && <Sparkles size={12} />} {m.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <AnimatePresence mode="wait">
            {mode === "selfie" && step === 0 && !results && (
              <motion.div key="selfie" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-accent">One photo — zero guessing</p>
                <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-pink-100 bg-white p-8 text-center" data-testid="selfie-panel">
                  {preview && loading ? (
                    <div>
                      <img src={preview} alt="Your selfie" className="mx-auto h-48 w-48 rounded-full object-cover shadow-lg" />
                      <p className="mt-5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-primary" data-testid="selfie-analysing">
                        <Sparkles size={14} className="animate-pulse" /> Reading your skin tone & undertone...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-blush">
                        <Camera size={30} className="text-primary" />
                      </div>
                      <p className="mt-5 font-serif text-xl font-semibold text-accent">Upload a selfie</p>
                      <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
                        Natural daylight, no filters, face the camera. Your photo is analysed once and never stored.
                      </p>
                      <input
                        ref={fileRef}
                        data-testid="selfie-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => runSelfie(e.target.files?.[0])}
                      />
                      <button
                        data-testid="selfie-upload-btn"
                        onClick={() => fileRef.current?.click()}
                        disabled={loading}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent disabled:opacity-50"
                      >
                        <UploadCloud size={16} /> Choose photo
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {mode === "quiz" && step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-accent">Step 1 — Your skin tone</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-5" data-testid="tone-options">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.key}
                      data-testid={`tone-${t.key}`}
                      onClick={() => { setTone(t.key); setStep(1); }}
                      className="group rounded-3xl border border-pink-100 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-pink-200"
                    >
                      <span className="mx-auto block h-14 w-14 rounded-full border border-black/10 transition-transform group-hover:scale-110" style={{ backgroundColor: t.hex }} />
                      <p className="mt-3 font-serif text-lg font-semibold text-accent">{t.label}</p>
                      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{t.hint}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {mode === "quiz" && step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-accent">Step 2 — Your undertone</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="undertone-options">
                  {UNDERTONE_OPTIONS.map((u) => (
                    <button
                      key={u.key}
                      data-testid={`undertone-${u.key}`}
                      onClick={() => { setUndertone(u.key); setStep(2); }}
                      className="rounded-3xl border border-pink-100 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-pink-200"
                    >
                      <p className="font-serif text-xl font-semibold capitalize text-accent">{u.label}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{u.hint}</p>
                    </button>
                  ))}
                </div>
                <button data-testid="back-to-tone" onClick={() => setStep(0)} className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
                  <ArrowLeft size={13} /> Back
                </button>
              </motion.div>
            )}

            {mode === "quiz" && step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-accent">Step 3 — What are we matching?</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3" data-testid="category-options">
                  {CATS.map((c) => (
                    <button
                      key={c}
                      data-testid={`match-category-${c.toLowerCase()}`}
                      onClick={() => { setCategory(c); runMatch(c); }}
                      disabled={loading}
                      className="rounded-full border border-pink-200 bg-white px-8 py-3.5 font-serif text-lg font-semibold text-accent transition-all hover:border-primary hover:bg-primary hover:text-white disabled:opacity-50"
                    >
                      {c === "All" ? "Everything" : c}
                    </button>
                  ))}
                </div>
                {loading && <p className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-primary">Analysing 209 shades...</p>}
                <button data-testid="back-to-undertone" onClick={() => setStep(1)} className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary">
                  <ArrowLeft size={13} /> Back
                </button>
              </motion.div>
            )}

            {step === 3 && results && (
              <motion.div key="s3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                {analysis && (
                  <div className="mb-8 flex flex-wrap items-center gap-5 rounded-3xl border border-pink-100 bg-white p-6" data-testid="selfie-analysis">
                    {preview && <img src={preview} alt="Analysed selfie" className="h-20 w-20 rounded-full object-cover shadow-md" />}
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">AI reading</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-rose-blush px-3.5 py-1.5 text-xs font-bold capitalize text-accent">
                          <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: TONE_HEX[analysis.tone] }} />
                          {analysis.tone} skin
                        </span>
                        <span className="rounded-full bg-rose-blush px-3.5 py-1.5 text-xs font-bold capitalize text-accent">{analysis.undertone} undertone</span>
                        <span className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-white">{analysis.confidence}% confident</span>
                      </div>
                      {analysis.note && <p className="mt-2.5 text-sm text-muted-foreground">{analysis.note}</p>}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary" data-testid="match-summary">
                      {results.total_analysed} shades analysed Â· {results.tone} skin Â· {results.undertone} undertone
                    </p>
                    <h2 className="mt-1 font-serif text-3xl font-bold text-accent">Your matches</h2>
                  </div>
                  <button data-testid="retake-quiz" onClick={reset} className="flex items-center gap-1.5 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-accent hover:text-primary">
                    <RotateCcw size={13} /> Start over
                  </button>
                </div>

                <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-primary">Perfect matches Â· 90%+ confidence</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="perfect-matches">
                  {results.perfect.map((s) => (
                    <MatchCard key={s.id} shade={s} onAdd={() => add({ id: s.product_id, name: s.product_name, type: s.type, image: s.image, price: s.price }, s)} onView={() => navigate(`/product/${s.product_id}`)} />
                  ))}
                </div>
                {results.perfect.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No 90%+ matches in this category — see the close matches below.</p>}

                <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Close matches</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="good-matches">
                  {results.good.map((s) => (
                    <MatchCard key={s.id} shade={s} onAdd={() => add({ id: s.product_id, name: s.product_name, type: s.type, image: s.image, price: s.price }, s)} onView={() => navigate(`/product/${s.product_id}`)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const MatchCard = ({ shade, onAdd, onView }) => (
  <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200" data-testid={`match-card-${shade.id}`}>
    <button onClick={onView} className="block w-full">
      <div className="relative h-28" style={{ backgroundColor: shade.hex }}>
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
          {shade.match}%
        </span>
      </div>
    </button>
    <div className="p-3.5">
      <p className="truncate font-serif text-sm font-bold text-accent">{shade.name}</p>
      <p className="truncate text-[11px] text-muted-foreground">{shade.product_name}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{inr(shade.price)}</p>
        <button
          data-testid={`match-add-${shade.id}`}
          onClick={onAdd}
          disabled={shade.stock === 0}
          className="flex items-center gap-1 rounded-full bg-rose-blush px-3 py-1.5 text-[10px] font-bold text-accent transition-colors hover:bg-primary hover:text-white disabled:opacity-40"
        >
          <ShoppingBag size={11} /> {shade.stock === 0 ? "Sold out" : "Add"}
        </button>
      </div>
    </div>
  </div>
);
