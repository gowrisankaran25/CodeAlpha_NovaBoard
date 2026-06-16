import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl animate-blob" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-sky-500/25 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative w-full max-w-md glass-panel p-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between px-4">
          <div className="mt-[-4rem] w-56 h-56 rounded-full bg-indigo-600/30 blur-3xl animate-blob" />
          <div className="mt-[-3rem] w-44 h-44 rounded-full bg-sky-500/25 blur-3xl animate-blob animation-delay-2000" />
        </div>

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-100">NovaBoard</span>
          </div>
          <p className="text-sm text-slate-500">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="relative z-10 card p-6 motion-safe:animate-slide-in-up">
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-900/30 border border-red-800/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="label block mb-1.5">Full Name</label>
                <input
                  className="input"
                  placeholder="Alice Chen"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="label block mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label block mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-800 text-center">
            {mode === "login" ? (
              <p className="text-sm text-slate-500">
                No account?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-indigo-400 hover:text-indigo-300">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Already have one?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-indigo-400 hover:text-indigo-300">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Seed hint */}
        <p className="mt-4 text-center text-xs text-slate-700">
          Demo: alice@example.com / password123
        </p>
      </div>
    </div>
  );
};

export default Login;
