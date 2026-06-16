import { useState } from "react";
import Avatar from "../components/ui/Avatar";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", avatar: user?.avatar || "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=blue-spark",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=strong-bot",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=starry-night",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=bright-glow",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=happy-hero",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=adventure-time",
  ];

  const displayedUser = {
    name: form.name || user?.name || "Your avatar",
    avatar: form.avatar || user?.avatar,
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await updateProfile(form);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto glass-panel p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">Profile settings</h1>
            <p className="text-sm text-slate-400 mt-1">Update your account details and avatar.</p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar user={displayedUser} size="xl" className="shadow-lg shadow-slate-950/30" />
          </div>
        </div>

        {message && <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-200">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label block mb-2">Email</label>
            <input className="input cursor-not-allowed bg-slate-800/80" value={user?.email || ""} readOnly />
          </div>

          <div>
            <label className="label block mb-2">Full name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="label block mb-2">Avatar URL</label>
            <input
              className="input"
              value={form.avatar}
              onChange={(e) => set("avatar", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-slate-500 mt-2">Leave blank to keep your current avatar.</p>
          </div>

          <div>
            <label className="label block mb-3">Choose a quick avatar</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {avatarOptions.map((avatarUrl) => (
                <button
                  key={avatarUrl}
                  type="button"
                  onClick={() => set("avatar", avatarUrl)}
                  className={`rounded-3xl border p-1 transition-all ${form.avatar === avatarUrl ? "border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.18)]" : "border-slate-700/60 hover:border-slate-500"}`}
                >
                  <img src={avatarUrl} alt="Avatar option" className="w-full h-16 object-cover rounded-2xl" />
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
