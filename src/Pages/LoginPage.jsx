import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import { loginUser } from "../features/auth/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, loading, error } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/dashboard";
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (token) navigate(from, { replace: true });
  }, [token, navigate, from]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="space-y-5 p-8 sm:p-10">
          <span className="app-chip">Welcome back</span>
          <h1 className="font-display text-5xl text-zinc-100 sm:text-6xl">Access your studio</h1>
          <p className="text-zinc-400">
            Log in to publish faster, manage your profile, and keep your feed tuned to high-signal content.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {["Fast", "Focused", "Creator-first"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/60 p-3 text-center text-sm text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-8 sm:p-10">
        <h2 className="font-display text-4xl text-zinc-100">Sign In</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
          />

          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand-400 py-3 text-sm font-semibold text-black hover:bg-brand-300 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-500">
          New here? <Link to="/register" className="font-semibold text-zinc-300 hover:text-white">Create account</Link>
        </p>
      </Card>
    </div>
  );
}
