const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, "app.json"));
const db = low(adapter);

// Default structure
db.defaults({
  users: [],
  projects: [],
  project_members: [],
  columns: [],
  tasks: [],
  comments: [],
}).write();

module.exports = db;
