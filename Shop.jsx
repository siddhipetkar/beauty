import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

const CATS = ["All", "Lips", "Face", "Eyes"];
const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = params.get("category") || "All";
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category !== "All") query.set("category", category);
    if (q) query.set("q", q);
    query.set("sort", sort);
    api.get(`/products?${query.toString()}`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, q, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="shop-page">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">The Boutique</p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-accent sm:text-5xl">
          Shop {category !== "All" ? category : "Everything"}
        </h1>
        <p className="mt-2 text-muted-foreground">44 products Â· 209 shades Â· only makeup, always in ₹</p>
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center gap-3" data-testid="shop-filters">
        <div className="flex rounded-full border border-pink-200 bg-white p-1">
          {CATS.map((c) => (
            <button
              key={c}
              data-testid={`filter-${c.toLowerCase()}`}
              onClick={() => setParams(c === "All" ? {} : { category: c })}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                category === c ? "bg-accent text-white" : "text-foreground/60 hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            data-testid="shop-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lipstick, mascara..."
            className="w-full rounded-full border border-pink-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          data-testid="shop-sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-foreground/70 outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground" data-testid="shop-count">
          {products.length} products
        </span>
      </div>

      {loading ? (
        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-rose-wall" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-20 text-center text-muted-foreground" data-testid="shop-empty">No products found. Try another search.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
