const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { verifyTokenMiddleware } = require("../middlewares/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyTokenMiddleware, getMe);
router.patch("/me", verifyTokenMiddleware, updateProfile);

module.exports = router;
