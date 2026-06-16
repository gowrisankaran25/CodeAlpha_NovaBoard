const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("./database");

console.log("🌱 Seeding database...");

// Clear existing data
db.set("users", []).set("projects", []).set("project_members", [])
  .set("columns", []).set("tasks", []).set("comments", []).write();

const hp = bcrypt.hashSync("password123", 10);
const now = new Date().toISOString();

const alice = { id: uuidv4(), email: "alice@example.com", name: "Alice Chen", password: hp, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice", created_at: now };
const bob   = { id: uuidv4(), email: "bob@example.com",   name: "Bob Smith",  password: hp, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",   created_at: now };
const carol = { id: uuidv4(), email: "carol@example.com", name: "Carol Davis",password: hp, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol", created_at: now };

db.get("users").push(alice, bob, carol).write();

const pid = uuidv4();
db.get("projects").push({ id: pid, name: "Website Redesign", description: "Full redesign of the marketing website", color: "#6366f1", owner_id: alice.id, created_at: now, updated_at: now }).write();

db.get("project_members").push(
  { id: uuidv4(), project_id: pid, user_id: alice.id, role: "OWNER", joined_at: now },
  { id: uuidv4(), project_id: pid, user_id: bob.id,   role: "ADMIN", joined_at: now },
  { id: uuidv4(), project_id: pid, user_id: carol.id, role: "MEMBER",joined_at: now }
).write();

const cols = [
  { id: uuidv4(), project_id: pid, name: "Backlog",     color: "#94a3b8", order: 0, created_at: now },
  { id: uuidv4(), project_id: pid, name: "In Progress", color: "#f59e0b", order: 1, created_at: now },
  { id: uuidv4(), project_id: pid, name: "Review",      color: "#8b5cf6", order: 2, created_at: now },
  { id: uuidv4(), project_id: pid, name: "Done",        color: "#10b981", order: 3, created_at: now },
];
db.get("columns").push(...cols).write();
const [backlog, inProgress, review, done] = cols;

db.get("tasks").push(
  { id: uuidv4(), title: "Define brand guidelines",    description: "Create comprehensive brand guidelines.", column_id: done.id,       project_id: pid, creator_id: alice.id, assignee_id: alice.id, priority: "HIGH",   labels: ["design","brand"],    order: 0, created_at: now, updated_at: now },
  { id: uuidv4(), title: "Design homepage wireframes", description: "Wireframes for the new homepage.",      column_id: inProgress.id, project_id: pid, creator_id: alice.id, assignee_id: bob.id,   priority: "HIGH",   labels: ["design","ux"],       order: 0, created_at: now, updated_at: now },
  { id: uuidv4(), title: "Set up component library",   description: "Initialize Storybook and base UI.",     column_id: inProgress.id, project_id: pid, creator_id: bob.id,   assignee_id: carol.id, priority: "MEDIUM", labels: ["frontend","dev"],    order: 1, created_at: now, updated_at: now },
  { id: uuidv4(), title: "Write copy for About page",  description: "Draft new About Us page content.",      column_id: backlog.id,    project_id: pid, creator_id: alice.id, assignee_id: null,     priority: "LOW",    labels: ["content"],           order: 0, created_at: now, updated_at: now },
  { id: uuidv4(), title: "SEO audit of current site",  description: "Document current SEO status.",          column_id: backlog.id,    project_id: pid, creator_id: bob.id,   assignee_id: bob.id,   priority: "MEDIUM", labels: ["seo","research"],    order: 1, created_at: now, updated_at: now },
  { id: uuidv4(), title: "Prototype navigation",       description: "Interactive prototype in Figma.",        column_id: review.id,     project_id: pid, creator_id: carol.id, assignee_id: carol.id, priority: "HIGH",   labels: ["design","ux"],       order: 0, created_at: now, updated_at: now }
).write();

console.log("✅ Seeding complete!");
console.log("\n📧 Test accounts:");
console.log("   alice@example.com / password123");
console.log("   bob@example.com   / password123");
console.log("   carol@example.com / password123");
