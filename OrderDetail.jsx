import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, PackageCheck } from "lucide-react";
import { api, inr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STEP_LABELS = {
  placed: "Order placed", confirmed: "Confirmed", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for delivery", delivered: "Delivered",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).catch(() => setOrder(false));
    api.get(`/orders/${id}/track`).then((res) => setTrack(res.data)).catch(() => {});
  }, [id, user]);

  if (!user) return <p className="py-32 text-center text-muted-foreground">Sign in to view this order.</p>;
  if (order === false) return <p className="py-32 text-center text-muted-foreground" data-testid="order-not-found">Order not found.</p>;
  if (!order) return <div className="mx-auto max-w-4xl px-6 py-20"><div className="h-40 animate-pulse rounded-3xl bg-rose-wall" /></div>;

  const success = params.get("success") === "1";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8" data-testid="order-detail-page">
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex items-center gap-4 rounded-3xl bg-green-50 p-6"
          data-testid="order-success-banner"
        >
          <PackageCheck size={30} className="text-green-600" />
          <div>
            <p className="font-serif text-2xl font-bold text-green-800">Order placed successfully!</p>
            <p className="text-sm text-green-700">A confirmation is on its way. You earned {order.points_earned} loyalty points.</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">Order {order.id}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-accent" data-testid="order-title">
            {order.items.length} item{order.items.length > 1 ? "s" : ""} Â· {inr(order.total)}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} Â· {order.payment_mode}
          </p>
        </div>
        <span className="rounded-full bg-rose-blush px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-accent" data-testid="order-status">
          {STEP_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-3xl border border-pink-100 bg-white p-6" data-testid="order-items">
            <h2 className="font-serif text-lg font-bold text-accent">Items</h2>
            <div className="mt-4 space-y-4">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <Link to={`/product/${i.product_id}`}>
                    <img src={i.image} alt={i.product_name} className="h-16 w-14 rounded-xl object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-accent">{i.product_name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: i.hex }} />
                      {i.shade_name} Ã— {i.qty}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{inr(i.price * i.qty)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-pink-100 bg-white p-6" data-testid="order-price-breakup">
            <h2 className="font-serif text-lg font-bold text-accent">Price Breakup</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Product total</span><span>{inr(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({order.coupon})</span><span>âˆ’ {inr(order.discount)}</span></div>}
              {order.points_used > 0 && <div className="flex justify-between text-green-700"><span>Loyalty points redeemed</span><span>âˆ’ {inr(order.points_used)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">GST ({order.gst_rate}%)</span><span>{inr(order.gst_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery fee</span><span>{order.delivery_fee === 0 ? "FREE" : inr(order.delivery_fee)}</span></div>
              <div className="flex justify-between border-t border-pink-100 pt-3 font-serif text-lg font-bold text-accent">
                <span>Paid via {order.payment_mode}</span><span>{inr(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-pink-100 bg-white p-6" data-testid="order-address">
            <h2 className="font-serif text-lg font-bold text-accent">Delivering to</h2>
            <p className="mt-3 text-sm font-semibold">{order.address.name} Â· {order.address.phone}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pincode}
            </p>
          </section>
        </div>

        <div className="lg:col-span-5">
          <section className="rounded-3xl border border-pink-100 bg-white p-6 lg:sticky lg:top-24" data-testid="order-tracking">
            <h2 className="font-serif text-lg font-bold text-accent">Track Order</h2>
            <div className="mt-6 space-y-0">
              {(track?.steps || []).map((s, i) => (
                <div key={s.key} className="flex gap-4" data-testid={`track-step-${s.key}`}>
                  <div className="flex flex-col items-center">
                    {s.done
                      ? <CheckCircle2 size={20} className="shrink-0 text-primary" />
                      : <Circle size={20} className="shrink-0 text-pink-200" />}
                    {i < track.steps.length - 1 && <span className={`h-9 w-0.5 ${s.done && track.steps[i + 1].done ? "bg-primary" : "bg-pink-100"}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-semibold ${s.done ? "text-accent" : "text-muted-foreground"}`}>{STEP_LABELS[s.key]}</p>
                    {s.at && <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {new Date(s.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, {new Date(s.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
