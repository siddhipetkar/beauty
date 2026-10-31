import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Package, Sparkles, BellRing, Heart, MapPin, Trash2, ShoppingBag } from "lucide-react";
import { api, inr, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";

const TABS = [
  { key: "orders", label: "Orders", icon: Package },
  { key: "loyalty", label: "Loyalty Points", icon: Sparkles },
  { key: "restock", label: "Restock Alerts", icon: BellRing },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
];

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "orders";
  const { add } = useCart();

  const [orders, setOrders] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (user === false) navigate("/login?next=/account");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/orders/my").then((r) => setOrders(r.data)).catch(() => {});
    api.get("/loyalty").then((r) => setLoyalty(r.data)).catch(() => {});
    api.get("/restock-alerts/my").then((r) => setAlerts(r.data)).catch(() => {});
    api.get("/wishlist").then((r) => setWishlist(r.data)).catch(() => {});
    api.get("/addresses").then((r) => setAddresses(r.data)).catch(() => {});
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="account-page">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">My Account</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-accent" data-testid="account-greeting">Hello, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email} Â· {loyalty ? `${loyalty.balance} loyalty points` : ""}</p>
      </Reveal>

      <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar" data-testid="account-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            data-testid={`tab-${t.key}`}
            onClick={() => setParams({ tab: t.key })}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "border-accent bg-accent text-white" : "border-pink-200 bg-white text-foreground/60 hover:text-primary"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "orders" && (
          <div className="space-y-4" data-testid="orders-tab">
            {orders.length === 0 && <Empty text="No orders yet — your shade story starts with one click." />}
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/order/${o.id}`}
                data-testid={`order-card-${o.id}`}
                className="block rounded-3xl border border-pink-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-100"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">{o.id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} Â· {o.payment_mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg font-bold text-accent">{inr(o.total)}</p>
                    <span className="rounded-full bg-rose-blush px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">{o.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex shrink-0 items-center gap-2 rounded-2xl bg-rose-blush/70 py-1.5 pl-1.5 pr-3">
                      <img src={i.image} alt="" className="h-9 w-8 rounded-lg object-cover" />
                      <div className="leading-tight">
                        <p className="max-w-[140px] truncate text-[11px] font-bold text-accent">{i.product_name}</p>
                        <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: i.hex }} />{i.shade_name} Ã— {i.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "loyalty" && loyalty && (
          <div data-testid="loyalty-tab">
            <div className="rounded-3xl bg-accent p-8 text-white">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-pink-200">Loyalty Balance</p>
              <p className="mt-2 font-serif text-5xl font-bold" data-testid="loyalty-balance">{loyalty.balance} pts</p>
              <p className="mt-2 text-sm text-pink-100/85">1 point = ₹1 Â· earn 5 points per ₹100 spent Â· redeem up to 20% of any order</p>
            </div>
            <div className="mt-6 space-y-3">
              {loyalty.transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-pink-100 bg-white px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-accent">{t.reason}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{new Date(t.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className={`font-serif text-lg font-bold ${t.points > 0 ? "text-green-700" : "text-red-500"}`}>
                    {t.points > 0 ? "+" : ""}{t.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "restock" && (
          <div className="space-y-3" data-testid="restock-tab">
            {alerts.length === 0 && <Empty text="No restock alerts. Tap the bell on any sold-out shade." />}
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white p-4" data-testid={`alert-${a.id}`}>
                {a.hex && <span className="h-10 w-10 shrink-0 rounded-xl border border-black/10" style={{ backgroundColor: a.hex }} />}
                <div className="flex-1">
                  <p className="text-sm font-bold text-accent">{a.product_name}</p>
                  {a.shade_name && <p className="text-xs text-muted-foreground">{a.shade_name}</p>}
                </div>
                {a.in_stock
                  ? <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">{a.notified ? "Email sent Â· Back in stock!" : "Back in stock!"}</span>
                  : <span className="rounded-full bg-rose-blush px-3 py-1 text-[10px] font-bold text-accent">{a.notified ? "Email sent" : "Watching"}</span>}
                <button data-testid={`alert-delete-${a.id}`} onClick={async () => { await api.delete(`/restock-alerts/${a.id}`); setAlerts(alerts.filter((x) => x.id !== a.id)); }} className="text-muted-foreground hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          <div data-testid="wishlist-tab">
            {wishlist.length === 0 && <Empty text="Your wishlist is empty. Heart a product to save it here." />}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-3xl border border-pink-100 bg-white" data-testid={`wishlist-${p.id}`}>
                  <Link to={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} className="aspect-[16/9] w-full object-cover" />
                  </Link>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-serif text-sm font-bold text-accent">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{inr(p.price)} Â· {p.shade_count} shades</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        data-testid={`wishlist-add-${p.id}`}
                        onClick={() => add(p, { id: p.default_shade_id, name: p.default_shade_name || "Signature shade", hex: p.default_shade_hex || "#D94678" })}
                        className="rounded-full bg-primary p-2.5 text-white hover:bg-accent"
                      >
                        <ShoppingBag size={14} />
                      </button>
                      <button
                        data-testid={`wishlist-remove-${p.id}`}
                        onClick={async () => { await api.delete(`/wishlist/${p.id}`); setWishlist(wishlist.filter((x) => x.id !== p.id)); toast.success("Removed from wishlist"); }}
                        className="rounded-full border border-pink-200 p-2.5 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "addresses" && (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="addresses-tab">
            {addresses.length === 0 && <Empty text="No saved addresses yet — we save one automatically at checkout." />}
            {addresses.map((a) => (
              <div key={a.id} className="rounded-3xl border border-pink-100 bg-white p-5" data-testid={`address-${a.id}`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-blush px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">{a.label}</span>
                  <button data-testid={`address-delete-${a.id}`} onClick={async () => { await api.delete(`/addresses/${a.id}`); setAddresses(addresses.filter((x) => x.id !== a.id)); }} className="text-muted-foreground hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="mt-3 text-sm font-bold text-accent">{a.name} Â· {a.phone}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Empty = ({ text }) => (
  <div className="rounded-3xl border border-dashed border-pink-200 bg-white/60 p-12 text-center text-sm text-muted-foreground">
    {text}
  </div>
);
