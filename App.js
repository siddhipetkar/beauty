import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import SwatchWall from "@/pages/SwatchWall";
import ShadeFinder from "@/pages/ShadeFinder";
import DupeFinder from "@/pages/DupeFinder";
import ShadeCompare from "@/pages/ShadeCompare";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderDetail from "@/pages/OrderDetail";
import Account from "@/pages/Account";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/swatch-wall" element={<SwatchWall />} />
                <Route path="/shade-finder" element={<ShadeFinder />} />
                <Route path="/dupe-finder" element={<DupeFinder />} />
                <Route path="/compare" element={<ShadeCompare />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:id" element={<OrderDetail />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
