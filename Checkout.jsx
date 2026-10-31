import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Smartphone, CreditCard, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { api, inr, apiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const PAYMENT_MODES = [
  { key: "COD", label: "Cash on Delivery", icon: Banknote, hint: "Pay when it arrives" },
  { key: "UPI", label: "UPI", icon: Smartphone, hint: "GPay / PhonePe / Paytm (simulated)" },
  { key: "Card", label: "Card", icon: CreditCard, hint: "Credit / debit card (simulated)" },
];

const EMPTY_ADDR = { label: "Home", name: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export default function Checkout() {
  const { user } = useAuth();
  const { items, clear, couponCode, setCouponCode } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(EMPTY_ADDR);
  const [saved, setSaved] = useState([]);
  const [mode, setMode] = useState("COD");
  const [quote, setQuote] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user === false) navigate("/login?next=/checkout");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/addresses").then((res) => {
      setSaved(res.data);
      if (res.data[0]) setAddress({ label: res.data[0].label, name: res.data[0].name, phone: res.data[0].phone, line1: res.data[0].line1, city: res.data[0].city, state: res.data[0].state, pincode: res.data[0].pincode });
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (items.length === 0) return;
    api.post("/pricing/quote", { items: items.map((i) => ({ product_id: i.product_id, shade_id: i.shade_id, qty: i.qty })), coupon_code: couponCode || null, redeem_points: false })
      .then((res) => setQuote(res.data)).catch(() => {});
  }, [items, couponCode]);

  if (!user || items.length === 0) {
    return <div className="py-32 text-center text-muted-foreground">{items.length === 0 ? "Your bag is empty." : "Loading..."}</div>;
  }

  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value });

  const placeOrder = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      return toast.error("Please fill in the full delivery address");
    }
    setPlacing(true);
    try {
      const res = await api.post("/orders", {
        items: items.map((i) => ({ product_id: i.product_id, shade_id: i.shade_id, qty: i.qty })),
        coupon_code: couponCode || null,
        redeem_points: false,
        address,
        payment_mode: mode,
      });
      clear();
      setCouponCode("");
      toast.success(`Order ${res.data.id} placed!`);
      navigate(`/order/${res.data.id}?success=1`);
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8" data-testid="checkout-page">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-accent">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Payment is simulated — no money moves, the order is real.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section className="rounded-3xl border border-pink-100 bg-white p-6" data-testid="address-section">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-accent"><MapPin size={18} className="text-primary" /> Delivery Address</h2>
            {saved.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {saved.map((a) => (
                  <button key={a.id} data-testid={`saved-address-${a.id}`} onClick={() => setAddress({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, city: a.city, state: a.state, pincode: a.pincode })}
                    className="rounded-full border border-pink-200 px-4 py-1.5 text-xs font-semibold text-accent hover:border-primary">
                    {a.label} — {a.city}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input data-testid="addr-name" value={address.name} onChange={set("name")} placeholder="Full name" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              <input data-testid="addr-phone" value={address.phone} onChange={set("phone")} placeholder="Phone (10 digits)" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              <input data-testid="addr-line1" value={address.line1} onChange={set("line1")} placeholder="Flat / street / landmark" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2" />
              <input data-testid="addr-city" value={address.city} onChange={set("city")} placeholder="City" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-3">
                <input data-testid="addr-state" value={address.state} onChange={set("state")} placeholder="State" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                <input data-testid="addr-pincode" value={address.pincode} onChange={set("pincode")} placeholder="Pincode" className="rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-pink-100 bg-white p-6" data-testid="payment-section">
            <h2 className="font-serif text-xl font-bold text-accent">Payment Mode</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PAYMENT_MODES.map((p) => (
                <button
                  key={p.key}
                  data-testid={`pay-${p.key.toLowerCase()}`}
                  onClick={() => setMode(p.key)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    mode === p.key ? "border-primary bg-rose-blush shadow-md" : "border-pink-200 hover:border-primary/50"
                  }`}
                >
                  <p.icon size={20} className={mode === p.key ? "text-primary" : "text-muted-foreground"} />
                  <p className="mt-2.5 text-sm font-bold text-accent">{p.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{p.hint}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 lg:sticky lg:top-24" data-testid="checkout-summary">
            <h2 className="font-serif text-xl font-bold text-accent">Order Summary</h2>
            <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.shade_id} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-12 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-accent">{i.product_name}</p>
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.hex }} /> {i.shade_name} Ã— {i.qty}
                    </p>
                  </div>
                  <p className="text-xs font-bold">{inr(i.price * i.qty)}</p>
                </div>
              ))}
            </div>
            {couponCode && (
              <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700" data-testid="checkout-coupon-note">
                <Tag size={12} /> {couponCode} applied from your bag
              </p>
            )}
            <div className="mt-5 space-y-2 border-t border-pink-100 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(quote?.subtotal)}</span></div>
              {quote?.discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon ({quote.coupon})</span><span>âˆ’ {inr(quote.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span>{inr(quote?.gst_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{quote?.delivery_fee === 0 ? "FREE" : inr(quote?.delivery_fee)}</span></div>
              <div className="flex justify-between border-t border-pink-100 pt-3 font-serif text-xl font-bold text-accent">
                <span>Total</span><span data-testid="checkout-total">{inr(quote?.total)}</span>
              </div>
            </div>
            <button
              data-testid="place-order-btn"
              onClick={placeOrder}
              disabled={placing}
              className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent disabled:opacity-50"
            >
              {placing ? "Placing order..." : `Place Order Â· ${inr(quote?.total)}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">Earn {quote ? Math.floor(quote.total / 100) * 5 : 0} loyalty points on this order</p>
          </div>
        </div>
      </div>
    </div>
  );
}
