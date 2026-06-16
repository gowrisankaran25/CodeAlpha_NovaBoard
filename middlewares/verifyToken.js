const { verifyToken } = require("../utils/jwtHelpers");
const { errorResponse } = require("../utils/apiResponse");
const db = require("../db/database");

const ROLE_RANK = { VIEWER: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };

const verifyTokenMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return errorResponse(res, "No token provided", 401);
    const decoded = verifyToken(auth.split(" ")[1]);
    const u = db.get("users").find({ id: decoded.userId }).value();
    if (!u) return errorResponse(res, "User not found", 401);
    req.user = { id: u.id, email: u.email, name: u.name, avatar: u.avatar };
    next();
  } catch { return errorResponse(res, "Invalid token", 401); }
};

const requireProjectAccess = (minRole = "VIEWER") => (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return errorResponse(res, "Project ID required", 400);
  const member = db.get("project_members").find({ project_id: projectId, user_id: req.user.id }).value();
  if (!member) return errorResponse(res, "Access denied", 403);
  if ((ROLE_RANK[member.role] ?? -1) < (ROLE_RANK[minRole] ?? 0)) return errorResponse(res, `Requires ${minRole} role`, 403);
  req.memberRole = member.role;
  next();
};

module.exports = { verifyTokenMiddleware, requireProjectAccess };
