import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { projectApi, taskApi } from "../api/projectApi";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import BoardColumn from "../components/board/BoardColumn";
import TaskCard from "../components/board/TaskCard";
import TaskDetailModal from "../components/board/TaskDetailModal";
import CreateTaskModal from "../components/board/CreateTaskModal";
import Avatar from "../components/ui/Avatar";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinProject, leaveProject, emit, on } = useSocket();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [createForColumn, setCreateForColumn] = useState(null);

  // DnD
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedTaskRef = useRef(selectedTask);

  useEffect(() => {
    selectedTaskRef.current = selectedTask;
  }, [selectedTask]);

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  };

  const isAdmin = project?.members?.some(
    (m) => m.user.id === user.id && ["ADMIN", "OWNER"].includes(m.role)
  );

  // Fetch project
  useEffect(() => {
    projectApi.getOne(projectId)
      .then((res) => setProject(res.data.data.project))
      .catch(() => setError("Project not found"))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Socket: join room + listen for events
  useEffect(() => {
    if (!project) return;
    joinProject(projectId);

    const off1 = on("task:created", ({ task }) => {
      setProject((p) => ({
        ...p,
        columns: p.columns.map((col) =>
          col.id === task.columnId ? { ...col, tasks: [...col.tasks, task] } : col
        ),
      }));
      addNotification(`Task created: ${task.title}`);
    });

    const off2 = on("task:updated", ({ task }) => {
      setProject((p) => ({
        ...p,
        columns: p.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t)),
        })),
      }));
      addNotification(`Task updated: ${task.title}`);
    });

    const off3 = on("task:moved", ({ taskId, columnId, order, sourceColumnId }) => {
      applyTaskMove(taskId, columnId, order, sourceColumnId);
    });

    const off4 = on("task:deleted", ({ taskId }) => {
      setProject((p) => ({
        ...p,
        columns: p.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        })),
      }));
      addNotification(`A task was deleted`);
    });

    const off5 = on("comment:added", ({ taskId, comment }) => {
      setProject((p) => ({
        ...p,
        columns: p.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === taskId
              ? { ...t, _count: { comments: (t._count?.comments || 0) + 1 } }
              : t
          ),
        })),
      }));

      const currentTask = selectedTaskRef.current;
      if (currentTask?.id === taskId) {
        setSelectedTask((t) => ({ ...t, comments: [...(t.comments || []), comment] }));
      }
      addNotification(`${comment.author.name} commented on a task`);
    });

    const off6 = on("user:joined", ({ message }) => addNotification(message));
    const off7 = on("user:left", ({ message }) => addNotification(message));

    return () => {
      leaveProject(projectId);
      off1?.();
      off2?.();
      off3?.();
      off4?.();
      off5?.();
      off6?.();
      off7?.();
    };
  }, [project?.id]);

  const applyTaskMove = useCallback((taskId, destColumnId, order, sourceColumnId) => {
    setProject((p) => {
      if (!p) return p;
      let movedTask = null;

      const withoutTask = p.columns.map((col) => {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) movedTask = task;
        return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
      });

      if (!movedTask) return p;
      movedTask = { ...movedTask, columnId: destColumnId };

      return {
        ...p,
        columns: withoutTask.map((col) => {
          if (col.id !== destColumnId) return col;
          const tasks = [...col.tasks];
          tasks.splice(order, 0, movedTask);
          return { ...col, tasks };
        }),
      };
    });
  }, []);

  // DnD handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const task = project.columns.flatMap((c) => c.tasks).find((t) => t.id === active.id);
    setActiveTask(task || null);
    emit("drag:start", { projectId, taskId: active.id, user });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColId = project.columns.find((c) => c.tasks.some((t) => t.id === active.id))?.id;
    const destColId = over.data?.current?.columnId || over.id;

    if (!sourceColId || sourceColId === destColId) return;

    // Optimistic move across columns
    applyTaskMove(active.id, destColId, project.columns.find((c) => c.id === destColId)?.tasks.length || 0, sourceColId);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    emit("drag:end", { projectId, taskId: active.id });

    if (!over) return;

    const destColId = over.data?.current?.columnId || over.id;
    const destCol = project.columns.find((c) => c.id === destColId);
    const sourceColId = project.columns.find((c) => c.tasks.some((t) => t.id === active.id))?.id
      || project.columns.find((c) => c.id !== destColId && c.id)?.id;

    if (!destCol) return;

    const order = destCol.tasks.findIndex((t) => t.id === over.id);
    const finalOrder = order === -1 ? destCol.tasks.length - 1 : order;

    try {
      await taskApi.move(projectId, active.id, {
        columnId: destColId,
        order: finalOrder,
        sourceColumnId: sourceColId,
      });

      // Broadcast to other users
      emit("task:moved", {
        projectId,
        taskId: active.id,
        columnId: destColId,
        order: finalOrder,
        sourceColumnId: sourceColId,
      });
    } catch (err) {
      console.error("Move failed", err);
      // Refresh to get correct state
      const res = await projectApi.getOne(projectId);
      setProject(res.data.data.project);
    }
  };

  // Task events
  const handleTaskCreated = (task) => {
    setProject((p) => ({
      ...p,
      columns: p.columns.map((col) =>
        col.id === task.columnId ? { ...col, tasks: [...col.tasks, task] } : col
      ),
    }));
    emit("task:created", { projectId, task });
  };

  const handleTaskUpdated = (updatedTask) => {
    setProject((p) => ({
      ...p,
      columns: p.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
      })),
    }));
    emit("task:updated", { projectId, task: updatedTask });
  };

  const handleTaskDeleted = (taskId) => {
    setProject((p) => ({
      ...p,
      columns: p.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      })),
    }));
    emit("task:deleted", { projectId, taskId });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return setInviteError("Please enter an email.");

    setInviteLoading(true);
    setInviteError("");
    try {
      const res = await projectApi.addMember(projectId, { email: inviteEmail.trim(), role: "MEMBER" });
      setProject((p) => ({ ...p, members: [...p.members, res.data.data.member] }));
      setInviteEmail("");
      addNotification(`Invited ${res.data.data.member.user.name}`);
    } catch (err) {
      setInviteError(err.response?.data?.message || "Failed to invite member.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member from the project?")) return;
    try {
      await projectApi.removeMember(projectId, userId);
      setProject((p) => ({
        ...p,
        members: p.members.filter((member) => member.user.id !== userId),
      }));
      addNotification("Member removed");
    } catch (err) {
      addNotification(err.response?.data?.message || "Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-3">{error || "Project not found"}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="glass-panel border border-slate-800/80 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-2xl shadow-slate-950/20 mx-6 mt-6 rounded-[2rem]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </button>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="font-semibold text-slate-100">{project.name}</span>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center gap-2">
          {project.members?.slice(0, 5).map((m) => (
            <Avatar key={m.user.id} user={m.user} size="sm" className="ring-2 ring-slate-950" />
          ))}
          <button onClick={() => navigate('/settings')} className="btn-ghost text-xs">Settings</button>
        </div>
      </nav>

      {/* Members */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="glass-panel border border-slate-800/80 p-5 rounded-[2rem] shadow-2xl shadow-slate-950/15 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Project team</h2>
              <p className="text-sm text-slate-400">Invite members, assign roles, and collaborate in real time.</p>
            </div>
            {isAdmin && (
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  className="input w-full sm:w-72"
                  placeholder="Invite by email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button className="btn-primary" type="submit" disabled={inviteLoading}>
                  {inviteLoading ? "Inviting..." : "Invite"}
                </button>
              </form>
            )}
          </div>
          {inviteError && <p className="mt-3 text-sm text-red-400">{inviteError}</p>}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {project.members?.map((member) => (
              <div key={member.user.id} className="glass-panel p-4 rounded-3xl border border-slate-800/70">
                <div className="flex items-center gap-3">
                  <Avatar user={member.user} size="sm" className="ring-2 ring-slate-950" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{member.user.name}</div>
                    <div className="text-xs text-slate-500">{member.role.toLowerCase()}</div>
                  </div>
                </div>
                {isAdmin && member.user.id !== user.id && (
                  <button
                    className="mt-4 btn-secondary w-full text-xs"
                    onClick={() => handleRemoveMember(member.user.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="glass-panel mx-6 p-4 rounded-[2rem] border border-slate-800/80 shadow-2xl shadow-slate-950/20">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 min-w-max">
            {project.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                onTaskClick={setSelectedTask}
                onAddTask={(colId) => setCreateForColumn(colId)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 opacity-90">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      </div>

      {notifications.length > 0 && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
          {notifications.map((note) => (
            <div key={note.id} className="glass-panel border border-slate-800/80 px-4 py-3 rounded-3xl shadow-2xl shadow-slate-950/30 max-w-xs">
              <p className="text-sm text-slate-100">{note.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={projectId}
          members={project.members}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {/* Create task modal */}
      {createForColumn && (
        <CreateTaskModal
          projectId={projectId}
          columnId={createForColumn}
          columns={project.columns}
          members={project.members}
          onClose={() => setCreateForColumn(null)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Project;
