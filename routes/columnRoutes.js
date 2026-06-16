const express = require("express");
const router = express.Router({ mergeParams: true });
const { createColumn, updateColumn, deleteColumn, reorderColumns } = require("../controllers/columnController");
const { verifyTokenMiddleware, requireProjectAccess } = require("../middlewares/verifyToken");

router.use(verifyTokenMiddleware);

// /api/projects/:projectId/columns
router.post("/", requireProjectAccess("ADMIN"), createColumn);
router.patch("/reorder", requireProjectAccess("ADMIN"), reorderColumns);
router.patch("/:columnId", requireProjectAccess("ADMIN"), updateColumn);
router.delete("/:columnId", requireProjectAccess("ADMIN"), deleteColumn);

module.exports = router;
