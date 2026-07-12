import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLES[1] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await signup(form.email, form.password, form.name, form.role);
      }
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-console-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Radio className="w-6 h-6 text-signal-amber" />
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-white leading-none">TransitOps</h1>
            <p className="text-xs font-mono text-console-muted tracking-wider mt-1">
              SMART TRANSPORT OPERATIONS
            </p>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display font-semibold text-lg text-white mb-1">
            {mode === "login" ? "Sign in to your console" : "Create your account"}
          </h2>
          <p className="text-sm text-console-muted mb-6">
            {mode === "login" ? "Enter your credentials to continue" : "One login, four roles"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label-text">Full Name</label>
                <input
                  className="input-field"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                className="input-field"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="label-text">Role (RBAC)</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-status-retired text-sm bg-status-retired/10 border border-status-retired/30 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-console-muted hover:text-signal-amber mt-4 w-full text-center transition-colors"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="text-center text-[11px] font-mono text-console-muted mt-6 tracking-wider">
          TRANSITOPS © 2026 · RBAC ENABLED
        </p>
      </div>
    </div>
  );
}
