import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const KEY = "auracart_cart";
const COUPON_KEY = "auracart_coupon";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem(COUPON_KEY) || "");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(COUPON_KEY, couponCode);
  }, [couponCode]);

  const add = useCallback((product, shade, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.shade_id === shade.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(10, next[idx].qty + qty) };
        return next;
      }
      return [...prev, {
        product_id: product.id, shade_id: shade.id, qty,
        product_name: product.name, type: product.type, image: product.image,
        shade_name: shade.name, hex: shade.hex, price: product.price,
      }];
    });
    toast.success(`${product.name} Â· ${shade.name} added to bag`);
  }, []);

  const remove = useCallback((shadeId) => {
    setItems((prev) => prev.filter((i) => i.shade_id !== shadeId));
  }, []);

  const setQty = useCallback((shadeId, qty) => {
    setItems((prev) => qty <= 0
      ? prev.filter((i) => i.shade_id !== shadeId)
      : prev.map((i) => (i.shade_id === shadeId ? { ...i, qty: Math.min(10, qty) } : i)));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCouponCode("");
  }, []);

  const { count, subtotal } = useMemo(() => ({
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
  }), [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal, couponCode, setCouponCode }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
