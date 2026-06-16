import { useState } from "react";
import Modal from "../ui/Modal";
import { taskApi } from "../../api/projectApi";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const COMMON_LABELS = ["design", "dev", "frontend", "backend", "bug", "feature", "content", "ux"];

const CreateTaskModal = ({ projectId, columnId, columns, members, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    columnId: columnId || columns?.[0]?.id || "",
    assigneeId: "",
    priority: "MEDIUM",
    dueDate: "",
    labels: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleLabel = (label) => {
    set("labels", form.labels.includes(label)
      ? form.labels.filter((l) => l !== label)
      : [...form.labels, label]
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    setError("");
    try {
      const res = await taskApi.create(projectId, {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate: form.dueDate || null,
      });
      onCreated?.(res.data.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="New Task" size="md">
      <div className="space-y-4">
        {error && <p className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

        <div>
          <input
            className="input"
            placeholder="Task title *"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div>
          <textarea
            className="input resize-none h-20"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Column */}
          <div>
            <label className="label block mb-1">Column</label>
            <select className="input" value={form.columnId} onChange={(e) => set("columnId", e.target.value)}>
              {columns?.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="label block mb-1">Priority</label>
            <select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Assignee */}
          <div>
            <label className="label block mb-1">Assignee</label>
            <select className="input" value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)}>
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="label block mb-1">Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="label block mb-2">Labels</label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_LABELS.map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`px-2 py-1 rounded-full text-xs transition-colors ${
                  form.labels.includes(label)
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button className="btn-primary flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create task"}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;
