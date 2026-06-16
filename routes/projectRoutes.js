const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const { verifyTokenMiddleware, requireProjectAccess } = require("../middlewares/verifyToken");

router.use(verifyTokenMiddleware);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", requireProjectAccess("VIEWER"), getProject);
router.patch("/:projectId", requireProjectAccess("ADMIN"), updateProject);
router.delete("/:projectId", deleteProject);

// Members
router.post("/:projectId/members", requireProjectAccess("ADMIN"), addMember);
router.delete("/:projectId/members/:userId", requireProjectAccess("ADMIN"), removeMember);

module.exports = router;
