const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const DEFAULT_COLUMNS = [
  { name: "Backlog", order: 0, color: "#94a3b8" },
  { name: "In Progress", order: 1, color: "#f59e0b" },
  { name: "Review", order: 2, color: "#8b5cf6" },
  { name: "Done", order: 3, color: "#10b981" },
];

const enrichProject = (project) => {
  const members = db.get("project_members").filter({ project_id: project.id }).value().map((m) => {
    const u = db.get("users").find({ id: m.user_id }).value();
    return { role: m.role, user: { id: u.id, name: u.name, avatar: u.avatar } };
  });
  const taskCount = db.get("tasks").filter({ project_id: project.id }).value().length;
  return { ...project, members, _count: { tasks: taskCount } };
};

const getProjects = (req, res) => {
  try {
    const memberEntries = db.get("project_members").filter({ user_id: req.user.id }).value();
    const projects = memberEntries.map((m) => {
      const p = db.get("projects").find({ id: m.project_id }).value();
      return p ? enrichProject(p) : null;
    }).filter(Boolean).sort((a, b) => b.updated_at?.localeCompare(a.updated_at));
    return successResponse(res, { projects });
  } catch (err) { console.error(err); return errorResponse(res, "Failed to fetch projects"); }
};

const getProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const project = db.get("projects").find({ id: projectId }).value();
    if (!project) return errorResponse(res, "Project not found", 404);

    const members = db.get("project_members").filter({ project_id: projectId }).value().map((m) => {
      const u = db.get("users").find({ id: m.user_id }).value();
      return { role: m.role, user: { id: u.id, name: u.name, avatar: u.avatar } };
    });

    const columns = db.get("columns").filter({ project_id: projectId }).value()
      .sort((a, b) => a.order - b.order)
      .map((col) => {
        const tasks = db.get("tasks").filter({ column_id: col.id }).value()
          .sort((a, b) => a.order - b.order)
          .map((t) => {
            const assignee = t.assignee_id ? db.get("users").find({ id: t.assignee_id }).value() : null;
            const creator  = db.get("users").find({ id: t.creator_id }).value();
            const commentCount = db.get("comments").filter({ task_id: t.id }).value().length;
            return { ...t, assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null, creator: creator ? { id: creator.id, name: creator.name } : null, _count: { comments: commentCount } };
          });
        return { ...col, tasks };
      });

    return successResponse(res, { project: { ...project, members, columns } });
  } catch (err) { console.error(err); return errorResponse(res, "Failed to fetch project"); }
};

const createProject = (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return errorResponse(res, "Project name is required", 400);
    const now = new Date().toISOString();
    const project = { id: uuidv4(), name, description: description || null, color: color || "#6366f1", owner_id: req.user.id, created_at: now, updated_at: now };
    db.get("projects").push(project).write();
    db.get("project_members").push({ id: uuidv4(), project_id: project.id, user_id: req.user.id, role: "OWNER", joined_at: now }).write();
    DEFAULT_COLUMNS.forEach((c) => db.get("columns").push({ id: uuidv4(), project_id: project.id, name: c.name, color: c.color, order: c.order, created_at: now }).write());
    req.params = { projectId: project.id };
    return getProject(req, res);
  } catch (err) { console.error(err); return errorResponse(res, "Failed to create project"); }
};

const updateProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, color } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color) updates.color = color;
    db.get("projects").find({ id: projectId }).assign(updates).write();
    return successResponse(res, { project: db.get("projects").find({ id: projectId }).value() });
  } catch (err) { return errorResponse(res, "Failed to update project"); }
};

const deleteProject = (req, res) => {
  try {
    const { projectId } = req.params;
    const project = db.get("projects").find({ id: projectId }).value();
    if (!project) return errorResponse(res, "Not found", 404);
    if (project.owner_id !== req.user.id) return errorResponse(res, "Only owner can delete", 403);
    db.get("projects").remove({ id: projectId }).write();
    db.get("project_members").remove({ project_id: projectId }).write();
    db.get("columns").remove({ project_id: projectId }).write();
    db.get("tasks").remove({ project_id: projectId }).write();
    return successResponse(res, null, 200, "Deleted");
  } catch (err) { return errorResponse(res, "Failed to delete project"); }
};

const addMember = (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = "MEMBER" } = req.body;
    const user = db.get("users").find({ email }).value();
    if (!user) return errorResponse(res, "User not found", 404);
    if (db.get("project_members").find({ project_id: projectId, user_id: user.id }).value()) return errorResponse(res, "Already a member", 409);
    db.get("project_members").push({ id: uuidv4(), project_id: projectId, user_id: user.id, role, joined_at: new Date().toISOString() }).write();
    return successResponse(res, { member: { role, user: { id: user.id, name: user.name, avatar: user.avatar } } }, 201);
  } catch (err) { return errorResponse(res, "Failed to add member"); }
};

const removeMember = (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const project = db.get("projects").find({ id: projectId }).value();
    if (project?.owner_id === userId) return errorResponse(res, "Cannot remove owner", 400);
    db.get("project_members").remove({ project_id: projectId, user_id: userId }).write();
    return successResponse(res, null, 200, "Removed");
  } catch (err) { return errorResponse(res, "Failed to remove member"); }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember };
