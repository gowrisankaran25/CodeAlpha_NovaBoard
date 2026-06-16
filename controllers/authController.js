const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/database");
const { generateToken } = require("../utils/jwtHelpers");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const safeUser = (u) => ({ id: u.id, email: u.email, name: u.name, avatar: u.avatar, created_at: u.created_at });

const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return errorResponse(res, "Email, name, and password are required", 400);
    if (password.length < 6) return errorResponse(res, "Password must be at least 6 characters", 400);
    if (db.get("users").find({ email }).value()) return errorResponse(res, "Email already in use", 409);

    const user = { id: uuidv4(), email, name, password: bcrypt.hashSync(password, 10), avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`, created_at: new Date().toISOString() };
    db.get("users").push(user).write();
    return successResponse(res, { user: safeUser(user), token: generateToken({ userId: user.id }) }, 201);
  } catch (err) { return errorResponse(res, "Registration failed"); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, "Email and password required", 400);
    const user = db.get("users").find({ email }).value();
    if (!user || !bcrypt.compareSync(password, user.password)) return errorResponse(res, "Invalid credentials", 401);
    return successResponse(res, { user: safeUser(user), token: generateToken({ userId: user.id }) });
  } catch (err) { return errorResponse(res, "Login failed"); }
};

const getMe = (req, res) => successResponse(res, { user: req.user });

const updateProfile = (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = db.get("users").find({ id: req.user.id });
    if (name) user.assign({ name }).write();
    if (avatar) user.assign({ avatar }).write();
    return successResponse(res, { user: safeUser(user.value()) });
  } catch (err) { return errorResponse(res, "Update failed"); }
};

module.exports = { register, login, getMe, updateProfile };
