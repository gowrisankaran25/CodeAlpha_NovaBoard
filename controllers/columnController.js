const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const createColumn = (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, color } = req.body;
    if (!name) return errorResponse(res, "Name required", 400);
    const cols = db.get("columns").filter({ project_id: projectId }).value();
    const maxOrder = cols.length ? Math.max(...cols.map((c) => c.order)) : -1;
    const column = { id: uuidv4(), project_id: projectId, name, color: color || "#94a3b8", order: maxOrder + 1, created_at: new Date().toISOString() };
    db.get("columns").push(column).write();
    return successResponse(res, { column }, 201);
  } catch (err) { return errorResponse(res, "Failed to create column"); }
};

const updateColumn = (req, res) => {
  try {
    const { columnId } = req.params;
    const { name, color } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (color) updates.color = color;
    db.get("columns").find({ id: columnId }).assign(updates).write();
    return successResponse(res, { column: db.get("columns").find({ id: columnId }).value() });
  } catch (err) { return errorResponse(res, "Failed to update column"); }
};

const deleteColumn = (req, res) => {
  try {
    const { columnId } = req.params;
    const taskCount = db.get("tasks").filter({ column_id: columnId }).value().length;
    if (taskCount > 0) return errorResponse(res, "Move tasks out first", 400);
    db.get("columns").remove({ id: columnId }).write();
    return successResponse(res, null, 200, "Deleted");
  } catch (err) { return errorResponse(res, "Failed to delete column"); }
};

const reorderColumns = (req, res) => {
  try {
    req.body.columnIds.forEach((id, i) => db.get("columns").find({ id }).assign({ order: i }).write());
    return successResponse(res, {});
  } catch (err) { return errorResponse(res, "Failed to reorder"); }
};

module.exports = { createColumn, updateColumn, deleteColumn, reorderColumns };
