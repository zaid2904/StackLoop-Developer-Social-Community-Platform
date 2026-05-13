import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import { RegisterUser } from "../features/auth/authSlice";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "" });

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(RegisterUser(formData)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") navigate("/login");
    });
  };

  return (
    <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8 sm:p-10">
        <h2 className="font-display text-4xl text-zinc-100">Create Account</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
            />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-brand-300 focus:outline-none"
          />

          <input
            type="password"
            name="password"
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
            className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-400 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="font-semibold text-zinc-300 hover:text-white">Sign in</Link>
        </p>
      </Card>

      <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
        <div className="space-y-5 p-8 sm:p-10">
          <span className="app-chip">Start publishing</span>
          <h1 className="font-display text-5xl text-zinc-100 sm:text-6xl">Join the creator network</h1>
          <p className="text-zinc-400">
            Share practical knowledge, build your public profile, and connect with people who value quality work.
          </p>
          <div className="space-y-2 text-sm text-zinc-300">
            <p>1. Create your profile</p>
            <p>2. Publish your first post</p>
            <p>3. Build your audience over time</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
