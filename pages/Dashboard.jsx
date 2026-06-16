import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectApi } from "../api/projectApi";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import { formatDate } from "../utils/helpers";

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#f97316", "#84cc16",
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    projectApi.getAll().then((res) => {
      setProjects(res.data.data.projects);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await projectApi.create(form);
      setProjects((p) => [res.data.data.project, ...p]);
      setShowCreate(false);
      setForm({ name: "", description: "", color: "#6366f1" });
      navigate(`/project/${res.data.data.project.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-shell min-h-screen">
      {/* Top nav */}
      <nav className="glass-panel border border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-2xl shadow-slate-950/20 mx-6 mt-6 rounded-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-slate-100">NovaBoard</span>
        </div>

        <div className="flex items-center gap-3">
          <Avatar user={user} size="sm" />
          <span className="text-sm text-slate-300">{user?.name}</span>
          <button onClick={() => navigate('/settings')} className="btn-ghost text-xs">Settings</button>
          <button onClick={logout} className="btn-ghost text-xs">Sign out</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
            <p className="text-sm text-slate-500 mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-panel p-5 h-36 animate-pulse bg-slate-900/80" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-slate-300 font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-slate-600 mb-4">Create your first project to get started</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>Create project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="card p-5 text-left hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-150 group"
              >
                {/* Color bar */}
                <div
                  className="w-full h-1 rounded-full mb-4"
                  style={{ backgroundColor: project.color }}
                />

                <h3 className="font-semibold text-slate-100 group-hover:text-white mb-1 truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto">
                  {/* Member avatars */}
                  <div className="flex -space-x-1.5">
                    {project.members?.slice(0, 4).map((m) => (
                      <Avatar key={m.user.id} user={m.user} size="xs" className="ring-2 ring-slate-900" />
                    ))}
                    {project.members?.length > 4 && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-xs text-slate-400">
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-600">
                    {project._count?.tasks || 0} task{project._count?.tasks !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <div className="space-y-4">
          <div>
            <label className="label block mb-1.5">Project Name *</label>
            <input
              className="input"
              placeholder="My awesome project"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="label block mb-1.5">Description</label>
            <textarea
              className="input resize-none h-16"
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="label block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900" : "hover:scale-110"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1" onClick={handleCreate} disabled={creating || !form.name.trim()}>
              {creating ? "Creating..." : "Create project"}
            </button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
