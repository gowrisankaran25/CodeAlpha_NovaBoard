const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Chen",
      password: hashedPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Smith",
      password: hashedPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      name: "Carol Davis",
      password: hashedPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carol",
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Full redesign of the marketing website with new brand guidelines",
      color: "#6366f1",
      ownerId: alice.id,
    },
  });

  // Add members
  await prisma.projectMember.createMany({
    data: [
      { userId: alice.id, projectId: project.id, role: "OWNER" },
      { userId: bob.id, projectId: project.id, role: "ADMIN" },
      { userId: carol.id, projectId: project.id, role: "MEMBER" },
    ],
  });

  // Create columns
  const columns = await Promise.all([
    prisma.column.create({ data: { name: "Backlog", order: 0, color: "#94a3b8", projectId: project.id } }),
    prisma.column.create({ data: { name: "In Progress", order: 1, color: "#f59e0b", projectId: project.id } }),
    prisma.column.create({ data: { name: "Review", order: 2, color: "#8b5cf6", projectId: project.id } }),
    prisma.column.create({ data: { name: "Done", order: 3, color: "#10b981", projectId: project.id } }),
  ]);

  const [backlog, inProgress, review, done] = columns;

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Define brand guidelines",
        description: "Create comprehensive brand guidelines including color palette, typography, and logo usage.",
        order: 0,
        priority: "HIGH",
        columnId: done.id,
        projectId: project.id,
        creatorId: alice.id,
        assigneeId: alice.id,
        labels: ["design", "brand"],
      },
      {
        title: "Design homepage wireframes",
        description: "Create wireframes for the new homepage layout.",
        order: 0,
        priority: "HIGH",
        columnId: inProgress.id,
        projectId: project.id,
        creatorId: alice.id,
        assigneeId: bob.id,
        labels: ["design", "ux"],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Set up component library",
        description: "Initialize Storybook and create base UI components.",
        order: 1,
        priority: "MEDIUM",
        columnId: inProgress.id,
        projectId: project.id,
        creatorId: bob.id,
        assigneeId: carol.id,
        labels: ["frontend", "dev"],
      },
      {
        title: "Write copy for About page",
        description: "Draft new About Us page content aligned with brand voice.",
        order: 0,
        priority: "LOW",
        columnId: backlog.id,
        projectId: project.id,
        creatorId: alice.id,
        labels: ["content"],
      },
      {
        title: "SEO audit of current site",
        description: "Document current SEO status and identify improvements.",
        order: 1,
        priority: "MEDIUM",
        columnId: backlog.id,
        projectId: project.id,
        creatorId: bob.id,
        assigneeId: bob.id,
        labels: ["seo", "research"],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Prototype navigation",
        description: "Build interactive prototype of the new navigation in Figma.",
        order: 0,
        priority: "HIGH",
        columnId: review.id,
        projectId: project.id,
        creatorId: carol.id,
        assigneeId: carol.id,
        labels: ["design", "ux"],
      },
    ],
  });

  console.log("✅ Seeding complete!");
  console.log(`\n📧 Test users:`);
  console.log(`   alice@example.com / password123`);
  console.log(`   bob@example.com / password123`);
  console.log(`   carol@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
