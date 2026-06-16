require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Init DB (creates tables on first run)
require("./db/database");

const authRoutes    = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes    = require("./routes/taskRoutes");
const columnRoutes  = require("./routes/columnRoutes");
const { errorHandler } = require("./middlewares/errorHandler");
const boardSockets  = require("./sockets/boardSockets");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.use("/api/auth",     authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks",   taskRoutes);
app.use("/api/projects/:projectId/columns", columnRoutes);

app.use("*", (_, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use(errorHandler);

boardSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💾 Database: SQLite (data/app.db)`);
});
