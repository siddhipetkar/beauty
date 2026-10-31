import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register(name, email, password);
        toast.success("Account created — 50 loyalty points gifted!");
      }
      navigate(params.get("next") || "/account");
    } catch (err) {
      toast.error(apiError(err, "Could not sign you in"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="texture-grain flex min-h-[85vh] items-center justify-center bg-rose-blush/60 px-6 py-16" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 shadow-2xl shadow-pink-200/50"
      >
        <div className="flex flex-col items-center">
          <Logo size={44} />
          <h1 className="mt-4 font-serif text-3xl font-bold text-accent" data-testid="auth-title">
            {mode === "login" ? "Welcome back" : "Join Lumière"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Sign in to your AuraCart account" : "Create an account — get 50 loyalty points free"}
          </p>
        </div>

        <div className="mt-6 flex rounded-full border border-pink-200 bg-rose-blush p-1">
          {["login", "register"].map((m) => (
            <button
              key={m}
              data-testid={`auth-mode-${m}`}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-full py-2 text-xs font-bold capitalize transition-colors ${mode === m ? "bg-accent text-white" : "text-foreground/60"}`}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "register" && (
            <input
              data-testid="auth-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          )}
          <input
            data-testid="auth-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            data-testid="auth-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Password (min 6 characters)" : "Password"}
            required
            minLength={6}
            className="w-full rounded-2xl border border-pink-200 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            data-testid="auth-submit-btn"
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-all hover:bg-accent disabled:opacity-50"
          >
            {busy ? "One moment..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-rose-blush p-4 text-[11px] leading-relaxed text-muted-foreground" data-testid="demo-creds">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Demo logins</p>
          <p className="mt-1.5">Customer — <span className="font-semibold text-accent">demo@lumierebeauty.in</span> / Demo@1234</p>
          <p>Admin — <span className="font-semibold text-accent">admin@lumierebeauty.in</span> / Lumiere@123</p>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Browsing as a guest? <Link to="/shop" className="font-semibold text-primary underline underline-offset-4">Continue to the shop</Link>
        </p>
      </motion.div>
    </div>
  );
}
