const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const enrichTask = (t) => {
  const assignee = t.assignee_id ? db.get("users").find({ id: t.assignee_id }).value() : null;
  const creator  = db.get("users").find({ id: t.creator_id }).value();
  const commentCount = db.get("comments").filter({ task_id: t.id }).value().length;
  return {
    ...t,
    assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
    creator:  creator  ? { id: creator.id,  name: creator.name }  : null,
    _count: { comments: commentCount },
  };
};

const getTasks = (req, res) => {
  try {
    const tasks = db.get("tasks").filter({ project_id: req.params.projectId }).value()
      .sort((a, b) => a.order - b.order).map(enrichTask);
    return successResponse(res, { tasks });
  } catch (err) { return errorResponse(res, "Failed to fetch tasks"); }
};

const getTask = (req, res) => {
  try {
    const task = db.get("tasks").find({ id: req.params.taskId }).value();
    if (!task) return errorResponse(res, "Task not found", 404);
    const comments = db.get("comments").filter({ task_id: task.id }).value()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((c) => {
        const author = db.get("users").find({ id: c.author_id }).value();
        return { ...c, author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null };
      });
    return successResponse(res, { task: { ...enrichTask(task), comments } });
  } catch (err) { return errorResponse(res, "Failed to fetch task"); }
};

const createTask = (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, columnId, assigneeId, priority, dueDate, labels } = req.body;
    if (!title) return errorResponse(res, "Title required", 400);
    if (!columnId) return errorResponse(res, "Column required", 400);
    const colTasks = db.get("tasks").filter({ column_id: columnId }).value();
    const maxOrder = colTasks.length ? Math.max(...colTasks.map((t) => t.order)) : -1;
    const now = new Date().toISOString();
    const task = { id: uuidv4(), title, description: description || null, column_id: columnId, project_id: projectId, creator_id: req.user.id, assignee_id: assigneeId || null, priority: priority || "MEDIUM", due_date: dueDate || null, labels: labels || [], order: maxOrder + 1, created_at: now, updated_at: now };
    db.get("tasks").push(task).write();
    return successResponse(res, { task: enrichTask(task) }, 201);
  } catch (err) { console.error(err); return errorResponse(res, "Failed to create task"); }
};

const updateTask = (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, assigneeId, priority, dueDate, labels } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (assigneeId !== undefined) updates.assignee_id = assigneeId || null;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.due_date = dueDate || null;
    if (labels !== undefined) updates.labels = labels;
    db.get("tasks").find({ id: taskId }).assign(updates).write();
    return successResponse(res, { task: enrichTask(db.get("tasks").find({ id: taskId }).value()) });
  } catch (err) { console.error(err); return errorResponse(res, "Failed to update task"); }
};

const moveTask = (req, res) => {
  try {
    const { taskId } = req.params;
    const { columnId, order, sourceColumnId } = req.body;

    // Shift tasks in dest column
    db.get("tasks").filter((t) => t.column_id === columnId && t.id !== taskId && t.order >= order)
      .each((t) => { t.order += 1; }).write();

    // Move task
    db.get("tasks").find({ id: taskId }).assign({ column_id: columnId, order, updated_at: new Date().toISOString() }).write();

    // Compact source column
    if (sourceColumnId && sourceColumnId !== columnId) {
      const remaining = db.get("tasks").filter({ column_id: sourceColumnId }).value().sort((a, b) => a.order - b.order);
      remaining.forEach((t, i) => db.get("tasks").find({ id: t.id }).assign({ order: i }).write());
    }

    return successResponse(res, { task: enrichTask(db.get("tasks").find({ id: taskId }).value()) });
  } catch (err) { console.error(err); return errorResponse(res, "Failed to move task"); }
};

const deleteTask = (req, res) => {
  try {
    db.get("tasks").remove({ id: req.params.taskId }).write();
    db.get("comments").remove({ task_id: req.params.taskId }).write();
    return successResponse(res, null, 200, "Deleted");
  } catch (err) { return errorResponse(res, "Failed to delete task"); }
};

const addComment = (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    if (!content) return errorResponse(res, "Content required", 400);
    const now = new Date().toISOString();
    const comment = { id: uuidv4(), task_id: taskId, author_id: req.user.id, content, created_at: now };
    db.get("comments").push(comment).write();
    const author = req.user;
    return successResponse(res, { comment: { ...comment, author: { id: author.id, name: author.name, avatar: author.avatar } } }, 201);
  } catch (err) { return errorResponse(res, "Failed to add comment"); }
};

const deleteComment = (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = db.get("comments").find({ id: commentId }).value();
    if (!comment) return errorResponse(res, "Not found", 404);
    if (comment.author_id !== req.user.id) return errorResponse(res, "Cannot delete others' comments", 403);
    db.get("comments").remove({ id: commentId }).write();
    return successResponse(res, null, 200, "Deleted");
  } catch (err) { return errorResponse(res, "Failed to delete comment"); }
};

module.exports = { getTasks, getTask, createTask, updateTask, moveTask, deleteTask, addComment, deleteComment };
