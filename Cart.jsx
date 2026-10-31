import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api, inr, apiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Reveal } from "@/components/Reveal";

export default function Cart() {
  const { items, setQty, remove, subtotal, couponCode: applied, setCouponCode: setApplied } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [redeem, setRedeem] = useState(false);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (items.length === 0) { setQuote(null); return; }
    api.post("/pricing/quote", {
      items: items.map((i) => ({ product_id: i.product_id, shade_id: i.shade_id, qty: i.qty })),
      coupon_code: applied || null,
      redeem_points: redeem,
    }).then((res) => setQuote(res.data)).catch(() => setQuote(null));
  }, [items, applied, redeem]);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await api.post("/coupons/validate", { code: coupon, subtotal });
      setApplied(res.data.code);
      toast.success(`${res.data.code} applied — ${res.data.description}`);
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center" data-testid="cart-empty">
        <p className="font-serif text-4xl font-bold text-accent">Your bag is empty</p>
        <p className="mt-3 text-muted-foreground">209 shades are waiting on the wall.</p>
        <button onClick={() => navigate("/shop")} data-testid="cart-shop-btn" className="mt-8 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent">
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="cart-page">
      <Reveal>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-accent">Your Bag</h1>
        <p className="mt-2 text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""} Â· prices include GST at checkout</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {items.map((i) => (
            <div key={i.shade_id} className="flex gap-4 rounded-3xl border border-pink-100 bg-white p-4" data-testid={`cart-item-${i.shade_id}`}>
              <Link to={`/product/${i.product_id}`} className="shrink-0">
                <img src={i.image} alt={i.product_name} className="h-24 w-20 rounded-2xl object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-base font-bold text-accent">{i.product_name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: i.hex }} />
                      {i.shade_name}
                    </p>
                  </div>
                  <button data-testid={`remove-${i.shade_id}`} onClick={() => remove(i.shade_id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-pink-200">
                    <button data-testid={`cart-minus-${i.shade_id}`} onClick={() => setQty(i.shade_id, i.qty - 1)} className="p-2 text-accent"><Minus size={13} /></button>
                    <span className="w-7 text-center text-xs font-bold">{i.qty}</span>
                    <button data-testid={`cart-plus-${i.shade_id}`} onClick={() => setQty(i.shade_id, i.qty + 1)} className="p-2 text-accent"><Plus size={13} /></button>
                  </div>
                  <p className="font-serif text-lg font-bold text-foreground">{inr(i.price * i.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 lg:sticky lg:top-24" data-testid="cart-summary">
            <h2 className="font-serif text-xl font-bold text-accent">Price Details</h2>

            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  data-testid="coupon-input"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code (try WELCOME10)"
                  className="w-full rounded-full border border-pink-200 py-2.5 pl-9 pr-3 font-mono text-xs uppercase outline-none focus:border-primary"
                />
              </div>
              <button data-testid="coupon-apply-btn" onClick={applyCoupon} className="rounded-full bg-accent px-5 text-xs font-semibold text-white hover:bg-primary">
                Apply
              </button>
            </div>
            {applied && (
              <p className="mt-2 flex items-center justify-between text-xs font-semibold text-green-700">
                {applied} applied
                <button data-testid="coupon-remove-btn" onClick={() => { setApplied(""); setCoupon(""); }} className="text-red-500 underline">remove</button>
              </p>
            )}

            {user && user.loyalty_points > 0 && (
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl bg-rose-blush p-3.5">
                <span className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <Sparkles size={14} className="text-primary" /> Redeem loyalty points ({user.loyalty_points} available)
                </span>
                <input data-testid="redeem-toggle" type="checkbox" checked={redeem} onChange={(e) => setRedeem(e.target.checked)} className="h-4 w-4 accent-[#D94678]" />
              </label>
            )}

            <div className="mt-5 space-y-2.5 border-t border-pink-100 pt-5 text-sm" data-testid="price-breakdown">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{inr(quote?.subtotal ?? subtotal)}</span></div>
              {quote?.discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon discount ({quote.coupon})</span><span>âˆ’ {inr(quote.discount)}</span></div>}
              {quote?.points_used > 0 && <div className="flex justify-between text-green-700"><span>Loyalty points</span><span>âˆ’ {inr(quote.points_used)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-semibold">{inr(quote?.gst_amount ?? Math.round(subtotal * 0.18))}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold">{quote ? (quote.delivery_fee === 0 ? <span className="text-green-700">FREE</span> : inr(quote.delivery_fee)) : "—"}</span>
              </div>
              <div className="flex justify-between border-t border-pink-100 pt-3 font-serif text-xl font-bold text-accent">
                <span>Total</span><span data-testid="cart-total">{inr(quote?.total ?? subtotal)}</span>
              </div>
            </div>

            <button
              data-testid="checkout-btn"
              onClick={() => navigate(user ? "/checkout" : "/login?next=/checkout")}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent hover:shadow-xl hover:shadow-pink-200"
            >
              {user ? "Proceed to Checkout" : "Sign in to Checkout"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">COD Â· UPI Â· Card — payment is simulated for this demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
