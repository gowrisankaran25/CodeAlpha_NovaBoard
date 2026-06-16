import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import PriorityBadge from "../ui/PriorityBadge";
import { formatDate, formatDateTime, isOverdue, PRIORITY_CONFIG } from "../../utils/helpers";
import { taskApi } from "../../api/projectApi";
import { useAuth } from "../../context/AuthContext";

const TaskDetailModal = ({ task: initialTask, projectId, members, onClose, onUpdated, onDeleted }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(initialTask);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: initialTask?.title || "",
    description: initialTask?.description || "",
  });

  useEffect(() => {
    if (initialTask) {
      // Fetch full task (with comments)
      taskApi.getOne(projectId, initialTask.id).then((res) => {
        setTask(res.data.data.task);
        setEditData({ title: res.data.data.task.title, description: res.data.data.task.description || "" });
      });
    }
  }, [initialTask?.id]);

  if (!task) return null;

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await taskApi.addComment(projectId, task.id, { content: comment });
      const newComment = res.data.data.comment;
      setTask((t) => ({ ...t, comments: [...(t.comments || []), newComment] }));
      setComment("");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await taskApi.deleteComment(projectId, task.id, commentId);
    setTask((t) => ({ ...t, comments: t.comments.filter((c) => c.id !== commentId) }));
  };

  const handleSaveEdit = async () => {
    const res = await taskApi.update(projectId, task.id, editData);
    const updated = res.data.data.task;
    setTask((t) => ({ ...t, ...updated }));
    setEditing(false);
    onUpdated?.(updated);
  };

  const handlePriorityChange = async (priority) => {
    const res = await taskApi.update(projectId, task.id, { priority });
    const updated = res.data.data.task;
    setTask((t) => ({ ...t, ...updated }));
    onUpdated?.(updated);
  };

  const handleAssigneeChange = async (assigneeId) => {
    const res = await taskApi.update(projectId, task.id, { assigneeId: assigneeId || null });
    const updated = res.data.data.task;
    setTask((t) => ({ ...t, ...updated }));
    onUpdated?.(updated);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await taskApi.delete(projectId, task.id);
    onDeleted?.(task.id);
    onClose();
  };

  const overdue = isOverdue(task.dueDate);

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {editing ? (
            <input
              className="input text-lg font-semibold mb-2"
              value={editData.title}
              onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-semibold text-slate-100 mb-1 leading-snug">{task.title}</h2>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-4 text-xs text-slate-500">
            <span>Created {formatDateTime(task.createdAt)}</span>
            {task.creator && <span>by {task.creator.name}</span>}
          </div>

          {/* Labels */}
          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {task.labels.map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <p className="label mb-2">Description</p>
            {editing ? (
              <textarea
                className="input resize-none h-28"
                value={editData.description}
                onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                {task.description || <span className="italic text-slate-600">No description</span>}
              </p>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2 mb-6">
              <button className="btn-primary" onClick={handleSaveEdit}>Save</button>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-ghost text-xs mb-6" onClick={() => setEditing(true)}>
              ✏️ Edit
            </button>
          )}

          {/* Comments */}
          <div>
            <p className="label mb-3">Comments ({task.comments?.length || 0})</p>
            <div className="space-y-3 mb-4">
              {task.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar user={c.author} size="sm" />
                  <div className="flex-1 bg-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{c.author.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600">{formatDate(c.createdAt)}</span>
                        {c.author.id === user.id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                          >
                            delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-2">
              <Avatar user={user} size="sm" />
              <div className="flex-1 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                />
                <button
                  className="btn-primary"
                  onClick={handleSubmitComment}
                  disabled={!comment.trim() || submittingComment}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 space-y-5">
          {/* Assignee */}
          <div>
            <p className="label mb-2">Assignee</p>
            <select
              className="input text-xs"
              value={task.assigneeId || ""}
              onChange={(e) => handleAssigneeChange(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <p className="label mb-2">Priority</p>
            <div className="space-y-1">
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handlePriorityChange(key)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors
                    ${task.priority === key ? `${config.bg} ${config.color} font-medium` : "text-slate-500 hover:bg-slate-800"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div>
              <p className="label mb-2">Due Date</p>
              <p className={`text-xs ${overdue ? "text-red-400" : "text-slate-400"}`}>
                {formatDate(task.dueDate)}
                {overdue && " (overdue)"}
              </p>
            </div>
          )}

          {/* Delete */}
          <div className="pt-4 border-t border-slate-800">
            <button onClick={handleDelete} className="btn-danger w-full text-xs">
              Delete task
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;
