import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Ticket, Users, BellRing, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, inr, apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: ShoppingBag },
  { key: "orders", label: "Orders", icon: Package },
  { key: "coupons", label: "Coupons", icon: Ticket },
  { key: "users", label: "Users", icon: Users },
  { key: "restock", label: "Restock", icon: BellRing },
];

const ORDER_STEPS = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Lips", type: "", price: "", mrp: "", image: "", description: "", shade_name: "Signature", shade_hex: "#C4708A", stock: 25 });

  const loadAll = () => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/products").then((r) => setProducts(r.data)).catch(() => {});
    api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
    api.get("/admin/coupons").then((r) => setCoupons(r.data)).catch(() => {});
    api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => {});
    api.get("/admin/restock-alerts").then((r) => setAlerts(r.data)).catch(() => {});
  };

  useEffect(() => {
    if (user === false) navigate("/login?next=/admin");
    if (user && user.role === "admin") loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;
  if (user.role !== "admin") {
    return <p className="py-32 text-center text-muted-foreground" data-testid="admin-denied">Admins only. Sign in with the admin account.</p>;
  }

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/products", {
        name: form.name, category: form.category, type: form.type,
        price: parseInt(form.price), mrp: parseInt(form.mrp || form.price),
        image: form.image || "https://images.unsplash.com/photo-1586495777744-4413f21062fa?crop=entropy&cs=srgb&fm=jpg&q=85",
        description: form.description,
        shades: [{ name: form.shade_name, hex: form.shade_hex, stock: parseInt(form.stock) }],
      });
      toast.success("Product created");
      setShowForm(false);
      setForm({ ...form, name: "", type: "", price: "", description: "" });
      loadAll();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const inputCls = "w-full rounded-2xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="admin-page">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">AuraCart Control Room</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-accent">Admin Panel</h1>

      <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar" data-testid="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            data-testid={`admin-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "border-accent bg-accent text-white" : "border-pink-200 bg-white text-foreground/60 hover:text-primary"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "dashboard" && stats && (
          <div data-testid="admin-dashboard">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Revenue", value: inr(stats.revenue) },
                { label: "Orders", value: stats.orders },
                { label: "Products", value: stats.products },
                { label: "Shades", value: stats.shades },
                { label: "Customers", value: stats.users },
                { label: "Active Coupons", value: stats.coupons },
                { label: "Restock Alerts", value: stats.restock_alerts },
                { label: "Low-stock Shades", value: stats.low_stock_shades },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-pink-100 bg-white p-5" data-testid={`stat-${s.label.toLowerCase().replace(/[ -]/g, "-")}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
                  <p className="mt-1.5 font-serif text-2xl font-bold text-accent">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-pink-100 bg-white p-6">
                <h3 className="font-serif text-lg font-bold text-accent">Orders by status</h3>
                <div className="mt-4 space-y-2.5">
                  {ORDER_STEPS.map((s) => {
                    const n = stats.orders_by_status[s] || 0;
                    const pct = stats.orders ? Math.round((n / stats.orders) * 100) : 0;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <span className="w-28 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.replace(/_/g, " ")}</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-rose-blush">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-accent">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-3xl border border-pink-100 bg-white p-6">
                <h3 className="font-serif text-lg font-bold text-accent">Top products</h3>
                <div className="mt-4 space-y-2">
                  {stats.top_products.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between rounded-2xl bg-rose-blush/70 px-4 py-2.5">
                      <span className="text-sm font-semibold text-accent">{i + 1}. {p.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{p.units} units</span>
                    </div>
                  ))}
                  {stats.top_products.length === 0 && <p className="text-sm text-muted-foreground">No sales yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div data-testid="admin-products">
            <div className="mb-5 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{products.length} products live</p>
              <button data-testid="admin-add-product-btn" onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent">
                <Plus size={14} /> New Product
              </button>
            </div>
            {showForm && (
              <form onSubmit={createProduct} className="mb-6 grid gap-3 rounded-3xl border border-pink-100 bg-white p-6 sm:grid-cols-2" data-testid="admin-product-form">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className={inputCls} data-testid="form-name" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} data-testid="form-category">
                  <option>Lips</option><option>Face</option><option>Eyes</option>
                </select>
                <input required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Type (e.g. Matte Lipstick)" className={inputCls} data-testid="form-type" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price ₹" className={inputCls} data-testid="form-price" />
                  <input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} placeholder="MRP ₹" className={inputCls} data-testid="form-mrp" />
                </div>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (blank = default)" className={inputCls} data-testid="form-image" />
                <div className="grid grid-cols-3 gap-3">
                  <input value={form.shade_name} onChange={(e) => setForm({ ...form, shade_name: e.target.value })} placeholder="Shade name" className={inputCls} data-testid="form-shade-name" />
                  <input type="color" value={form.shade_hex} onChange={(e) => setForm({ ...form, shade_hex: e.target.value })} className="h-full w-full rounded-2xl border border-pink-200" data-testid="form-shade-hex" />
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className={inputCls} data-testid="form-stock" />
                </div>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className={`${inputCls} sm:col-span-2`} data-testid="form-description" />
                <button type="submit" className="rounded-full bg-accent py-3 text-sm font-semibold text-white hover:bg-primary sm:col-span-2" data-testid="form-submit">
                  Create product
                </button>
              </form>
            )}
            <div className="overflow-x-auto rounded-3xl border border-pink-100 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-pink-100 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3.5">Product</th><th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th><th className="px-5 py-3.5">Shades</th><th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-pink-50 last:border-0" data-testid={`admin-product-${p.id}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-accent">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">{p.category}</td>
                      <td className="px-5 py-3 font-semibold">{inr(p.price)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {(p.shade_preview || []).slice(0, 4).map((h, i) => (
                            <span key={i} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: h }} />
                          ))}
                          <span className="ml-1 text-[10px] text-muted-foreground">{p.shade_count}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          data-testid={`admin-delete-${p.id}`}
                          onClick={async () => {
                            if (!window.confirm(`Delete ${p.name}?`)) return;
                            await api.delete(`/admin/products/${p.id}`);
                            toast.success("Product deleted");
                            loadAll();
                          }}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="overflow-x-auto rounded-3xl border border-pink-100 bg-white" data-testid="admin-orders">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th><th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Mode</th><th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-pink-50 last:border-0" data-testid={`admin-order-${o.id}`}>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-accent">{o.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{o.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{o.items.map((i) => `${i.shade_name}Ã—${i.qty}`).join(", ")}</td>
                    <td className="px-5 py-3 font-semibold">{inr(o.total)}</td>
                    <td className="px-5 py-3 text-xs">{o.payment_mode}</td>
                    <td className="px-5 py-3">
                      <select
                        data-testid={`admin-order-status-${o.id}`}
                        value={o.status}
                        onChange={async (e) => {
                          await api.patch(`/admin/orders/${o.id}/status`, { status: e.target.value });
                          toast.success(`Order ${o.id} â†’ ${e.target.value.replace(/_/g, " ")}`);
                          loadAll();
                        }}
                        className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-accent outline-none"
                      >
                        {ORDER_STEPS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "coupons" && (
          <div data-testid="admin-coupons">
            <CouponForm onCreated={loadAll} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="rounded-3xl border border-pink-100 bg-white p-5" data-testid={`admin-coupon-${c.id}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-bold text-accent">{c.code}</p>
                    <button
                      data-testid={`coupon-toggle-${c.id}`}
                      onClick={async () => { await api.patch(`/admin/coupons/${c.id}`, { active: !c.active }); loadAll(); }}
                      className={`rounded-full px-3 py-1 text-[10px] font-bold ${c.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {c.active ? "ACTIVE" : "OFF"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{c.description}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                    {c.type === "percent" ? `${c.value}% off` : c.type === "flat" ? `₹${c.value} off` : "Free shipping"} Â· min ₹{c.min_order}
                  </p>
                  <button
                    data-testid={`coupon-delete-${c.id}`}
                    onClick={async () => { await api.delete(`/admin/coupons/${c.id}`); toast.success("Coupon deleted"); loadAll(); }}
                    className="mt-3 text-[11px] font-semibold text-red-500 underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto rounded-3xl border border-pink-100 bg-white" data-testid="admin-users">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pink-100 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3.5">Name</th><th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th><th className="px-5 py-3.5">Points</th><th className="px-5 py-3.5">Orders</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-pink-50 last:border-0" data-testid={`admin-user-${u.id}`}>
                    <td className="px-5 py-3 font-semibold text-accent">{u.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${u.role === "admin" ? "bg-accent text-white" : "bg-rose-blush text-accent"}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3">{u.loyalty_points}</td>
                    <td className="px-5 py-3">{u.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "restock" && (
          <div className="space-y-3" data-testid="admin-restock">
            {alerts.length === 0 && <p className="rounded-3xl border border-dashed border-pink-200 p-10 text-center text-sm text-muted-foreground">No restock alerts yet.</p>}
            {alerts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-pink-100 bg-white p-4" data-testid={`admin-alert-${a.id}`}>
                <div>
                  <p className="text-sm font-bold text-accent">{a.product_name}{a.shade_name ? ` Â· ${a.shade_name}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{a.customer_email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.notified && <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">EMAILED</span>}
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CouponForm = ({ onCreated }) => {
  const [f, setF] = useState({ code: "", type: "percent", value: 10, min_order: 0, description: "" });
  const inputCls = "rounded-2xl border border-pink-200 px-4 py-2.5 text-sm outline-none focus:border-primary";
  return (
    <form
      data-testid="admin-coupon-form"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api.post("/admin/coupons", { ...f, value: Number(f.value), min_order: Number(f.min_order) });
          toast.success(`Coupon ${f.code.toUpperCase()} created`);
          setF({ code: "", type: "percent", value: 10, min_order: 0, description: "" });
          onCreated();
        } catch (err) {
          toast.error(apiError(err));
        }
      }}
      className="flex flex-wrap items-center gap-3 rounded-3xl border border-pink-100 bg-white p-5"
    >
      <input required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="CODE" className={`${inputCls} w-32 font-mono uppercase`} data-testid="coupon-code-input" />
      <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={inputCls} data-testid="coupon-type-select">
        <option value="percent">% off</option><option value="flat">₹ flat off</option><option value="freeship">Free shipping</option>
      </select>
      <input type="number" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="Value" className={`${inputCls} w-24`} data-testid="coupon-value-input" />
      <input type="number" value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} placeholder="Min order ₹" className={`${inputCls} w-32`} data-testid="coupon-min-input" />
      <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description" className={`${inputCls} min-w-48 flex-1`} data-testid="coupon-desc-input" />
      <button type="submit" className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary" data-testid="coupon-create-btn">Create</button>
    </form>
  );
};
