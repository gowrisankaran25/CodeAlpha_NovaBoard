/**
 * boardSockets.js
 * Handles real-time WebSocket events for Kanban board collaboration.
 * Each project has its own Socket.io room: `project:{projectId}`
 */

const boardSockets = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a project room for real-time collaboration
    socket.on("join:project", ({ projectId, user }) => {
      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("user:joined", {
        user,
        message: `${user.name} joined the board`,
      });
      console.log(`👤 ${user?.name} joined project:${projectId}`);
    });

    // Leave a project room
    socket.on("leave:project", ({ projectId, user }) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("user:left", {
        user,
        message: `${user.name} left the board`,
      });
    });

    // Broadcast task created
    socket.on("task:created", ({ projectId, task }) => {
      socket.to(`project:${projectId}`).emit("task:created", { task });
    });

    // Broadcast task updated
    socket.on("task:updated", ({ projectId, task }) => {
      socket.to(`project:${projectId}`).emit("task:updated", { task });
    });

    // Broadcast task moved (drag & drop)
    socket.on("task:moved", ({ projectId, taskId, columnId, order, sourceColumnId }) => {
      socket.to(`project:${projectId}`).emit("task:moved", {
        taskId,
        columnId,
        order,
        sourceColumnId,
      });
    });

    // Broadcast task deleted
    socket.on("task:deleted", ({ projectId, taskId, columnId }) => {
      socket.to(`project:${projectId}`).emit("task:deleted", { taskId, columnId });
    });

    // Broadcast comment added
    socket.on("comment:added", ({ projectId, taskId, comment }) => {
      socket.to(`project:${projectId}`).emit("comment:added", { taskId, comment });
    });

    // Cursor/presence: user is currently dragging
    socket.on("drag:start", ({ projectId, taskId, user }) => {
      socket.to(`project:${projectId}`).emit("drag:start", { taskId, user });
    });

    socket.on("drag:end", ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit("drag:end", { taskId });
    });

    // Column events
    socket.on("column:created", ({ projectId, column }) => {
      socket.to(`project:${projectId}`).emit("column:created", { column });
    });

    socket.on("column:updated", ({ projectId, column }) => {
      socket.to(`project:${projectId}`).emit("column:updated", { column });
    });

    socket.on("column:deleted", ({ projectId, columnId }) => {
      socket.to(`project:${projectId}`).emit("column:deleted", { columnId });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = boardSockets;
