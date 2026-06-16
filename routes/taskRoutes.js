const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  addComment,
  deleteComment,
} = require("../controllers/taskController");
const { verifyTokenMiddleware, requireProjectAccess } = require("../middlewares/verifyToken");

router.use(verifyTokenMiddleware);

// /api/projects/:projectId/tasks
router.get("/", requireProjectAccess("VIEWER"), getTasks);
router.post("/", requireProjectAccess("MEMBER"), createTask);
router.get("/:taskId", requireProjectAccess("VIEWER"), getTask);
router.patch("/:taskId", requireProjectAccess("MEMBER"), updateTask);
router.patch("/:taskId/move", requireProjectAccess("MEMBER"), moveTask);
router.delete("/:taskId", requireProjectAccess("MEMBER"), deleteTask);

// Comments
router.post("/:taskId/comments", requireProjectAccess("MEMBER"), addComment);
router.delete("/:taskId/comments/:commentId", requireProjectAccess("MEMBER"), deleteComment);

module.exports = router;
