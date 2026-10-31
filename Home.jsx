import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Palette, ScanSearch, BadgeIndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import { Marquee } from "@/components/Marquee";
import { MaskedLine, Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";

const HERO_IMG = "https://images.unsplash.com/photo-1548112129-b5cf67e9558d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxiZWF1dHklMjBtb2RlbCUyMG1ha2V1cHxlbnwwfHx8fDE3OTE4MDc5MjF8MA&ixlib=rb-4.1.0&q=85";
const EDITORIAL_IMG = "https://images.unsplash.com/photo-1542534759-05f6c34a9e63?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHw0fHxiZWF1dHklMjBtb2RlbCUyMHBvcnRyYWl0JTIwcGluayUyMHRvbmUlMjBlZGl0b3JpYWx8ZW58MHx8fHwxNzkxODA4NDA2fDA&ixlib=rb-4.1.0&q=85";
const TEXTURE_IMG = "https://images.unsplash.com/photo-1631214499500-2e34edcaccfe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxsaXBzdGljayUyMHN3YXRjaCUyMHRleHR1cmUlMjBjbG9zZSUyMHVwJTIwbWFrZXVwfGVufDB8fHx8MTc5MTgwODQwNnww&ixlib=rb-4.1.0&q=85";

const HERO_CHIPS = [
  { hex: "#B3202E", label: "Classic Red", rot: "-6deg" },
  { hex: "#E3A4B6", label: "Rose Quartz", rot: "4deg" },
  { hex: "#D9A86C", label: "Golden Hour", rot: "-3deg" },
];

export default function Home() {
  const [stats, setStats] = useState({ products: 44, shades: 209, tables: 13, apis: 40 });
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [teaser, setTeaser] = useState([]);
  const navigate = useNavigate();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const imgX = useTransform(mx, [-0.5, 0.5], [-14, 14]);
  const imgY = useTransform(my, [-0.5, 0.5], [-10, 10]);
  const chipX = useTransform(mx, [-0.5, 0.5], [18, -18]);

  useEffect(() => {
    Promise.all([
      api.get("/stats/public"),
      api.get("/categories"),
      api.get("/products?featured=true"),
      api.get("/shades"),
    ]).then(([s, c, f, sh]) => {
      setStats(s.data);
      setCategories(c.data);
      setFeatured(f.data.slice(0, 4));
      setTeaser(sh.data.filter((_, i) => i % 6 === 0).slice(0, 36));
    }).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section
        className="texture-grain relative overflow-hidden bg-background"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-12 sm:px-8 lg:grid-cols-12 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary"
              data-testid="hero-eyebrow"
            >
              Lumière Beauty Â· Smart Shade Intelligence
            </motion.p>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-[0.98] tracking-tight text-accent sm:text-6xl lg:text-7xl" data-testid="hero-headline">
              <MaskedLine delay={0.1}>Find the shade</MaskedLine>
              <MaskedLine delay={0.25}><span className="italic text-primary">that finds</span></MaskedLine>
              <MaskedLine delay={0.4}>you back.</MaskedLine>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              We treat colour as data — every one of our {stats.shades} shades carries a hex code,
              undertone and skin-tone map, so your perfect match is a calculation, not a guess.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <button
                data-testid="hero-quiz-btn"
                onClick={() => navigate("/shade-finder")}
                className="group flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary hover:shadow-xl hover:shadow-pink-200"
              >
                Take the Shade Quiz
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                data-testid="hero-swatch-btn"
                onClick={() => navigate("/swatch-wall")}
                className="rounded-full border border-accent/25 bg-white/60 px-7 py-3.5 text-sm font-semibold text-accent transition-colors hover:border-primary hover:text-primary"
              >
                Browse {stats.shades} Shades
              </button>
            </motion.div>
          </div>

          <div className="relative lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-sm"
            >
              <motion.div style={{ x: imgX, y: imgY }} className="hero-arch overflow-hidden shadow-2xl shadow-pink-300/40">
                <img src={HERO_IMG} alt="Lumière Beauty editorial" className="aspect-[3/4] w-full object-cover" />
              </motion.div>
              {HERO_CHIPS.map((chip, i) => (
                <motion.div
                  key={chip.hex}
                  style={{ x: chipX, "--float-rot": chip.rot, animationDelay: `${i * 0.8}s` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className={`animate-float-slow absolute flex items-center gap-2 rounded-full bg-white/90 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur ${
                    i === 0 ? "-left-6 top-10" : i === 1 ? "-right-4 top-1/3" : "bottom-10 -left-4"
                  }`}
                >
                  <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: chip.hex }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{chip.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* STATS BAND */}
      <section className="border-b border-pink-100 bg-white" data-testid="stats-band">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-pink-100 sm:grid-cols-4">
          {[
            { n: stats.products, label: "Products" },
            { n: stats.shades, label: "Shades as Data" },
            { n: stats.tables, label: "Data Tables" },
            { n: `${stats.apis}+`, label: "REST APIs" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="px-6 py-8 text-center">
              <p className="font-serif text-4xl font-bold text-primary">{s.n}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CATEGORY BENTO */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8" data-testid="category-bento">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Shop by ritual</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
            Lips, face & eyes — nothing else
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {categories.map((c, i) => (
            <Reveal
              key={c.id}
              delay={i * 0.1}
              className={i === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-3"}
            >
              <Link
                to={`/shop?category=${c.name}`}
                data-testid={`category-tile-${c.name.toLowerCase()}`}
                className="group relative block overflow-hidden rounded-3xl"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/3]"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-accent/80 via-accent/10 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="font-serif text-2xl font-bold text-white">{c.name}</p>
                  <p className="mt-1 max-w-[240px] text-xs text-pink-100/90">{c.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white">
                    Shop now <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-rose-blush/60 py-20" data-testid="featured-section">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">The edit</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
                Loved by the wall
              </h2>
            </div>
            <Link to="/shop" data-testid="view-all-products-link" className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent sm:flex">
              View all 44 <ArrowRight size={15} />
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SWATCH WALL TEASER */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8" data-testid="swatch-teaser">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Swatch Wall</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
              209 colours, hung like art
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every shade is a data point — hex code, undertone, coverage, finish and the skin tones it flatters.
              Wander the wall, filter by colour family, and let your eyes do the shopping.
            </p>
            <button
              data-testid="swatch-teaser-btn"
              onClick={() => navigate("/swatch-wall")}
              className="group mt-7 flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent"
            >
              <Palette size={16} /> Open the Swatch Wall
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-7">
            <div className="grid grid-cols-9 gap-1.5 rounded-3xl border border-pink-100 bg-white p-4 shadow-xl shadow-pink-100 sm:grid-cols-12">
              {teaser.map((s) => (
                <Link
                  key={s.id}
                  to={`/product/${s.product_id}`}
                  title={`${s.name} Â· ${s.hex}`}
                  className="swatch-ring aspect-square rounded-md"
                  style={{ backgroundColor: s.hex }}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SHADE FINDER + DUPE FINDER */}
      <section className="bg-accent py-20 text-white" data-testid="smart-tools">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-3xl">
              <img src={EDITORIAL_IMG} alt="Shade finder model" loading="lazy" className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="mt-7 flex items-start gap-4">
              <ScanSearch className="mt-1 shrink-0 text-pink-300" size={26} />
              <div>
                <h3 className="font-serif text-2xl font-semibold sm:text-3xl">Shade Finder</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-pink-100/85">
                  Tell us your skin tone and undertone. Our colour-data algorithm scores all 209 shades
                  and returns your matches with a confidence percentage.
                </p>
                <button
                  data-testid="shade-finder-cta"
                  onClick={() => navigate("/shade-finder")}
                  className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-accent transition-transform hover:scale-[1.03]"
                >
                  Find my shade
                </button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-3xl">
              <img src={TEXTURE_IMG} alt="Lipstick swatch texture" loading="lazy" className="aspect-[16/9] w-full object-cover" />
            </div>
            <div className="mt-7 flex items-start gap-4">
              <BadgeIndianRupee className="mt-1 shrink-0 text-pink-300" size={26} />
              <div>
                <h3 className="font-serif text-2xl font-semibold sm:text-3xl">Dupe Finder</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-pink-100/85">
                  Love a luxury shade? We compute colour distance across the whole wall and surface
                  near-identical shades at kinder prices — with exact ₹ savings.
                </p>
                <button
                  data-testid="dupe-finder-cta"
                  onClick={() => navigate("/dupe-finder")}
                  className="mt-5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-accent transition-transform hover:scale-[1.03]"
                >
                  Hunt a dupe
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EDITORIAL QUOTE */}
      <section className="texture-grain mx-auto max-w-5xl px-6 py-24 text-center sm:px-8">
        <Reveal>
          <Sparkles className="mx-auto text-primary" size={22} />
          <blockquote className="mt-6 font-serif text-3xl font-medium italic leading-snug text-accent sm:text-4xl" data-testid="editorial-quote">
            "Choosing the right shade online shouldn't depend on your screen's mood.
            Colour is data — and data doesn't lie."
          </blockquote>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            AuraCart Â· Group 16 Â· Dept. of IT
          </p>
        </Reveal>
      </section>
    </div>
  );
}
