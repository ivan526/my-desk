import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("=== 初始化管理员账号 ===\n");

  // Check if any admin exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log(`已存在管理员账号: ${existingAdmin.username}`);
    const answer = await new Promise<string>((resolve) => {
      rl.question("是否创建新的管理员账号? (y/N): ", resolve);
    });
    if (answer.toLowerCase() !== "y") {
      console.log("取消");
      rl.close();
      return;
    }
  }

  const username = await new Promise<string>((resolve) => {
    rl.question("请输入管理员用户名 (默认: admin): ", (ans) => {
      resolve(ans.trim() || "admin");
    });
  });

  // Check if username exists
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    console.error(`错误: 用户名 ${username} 已存在`);
    rl.close();
    process.exit(1);
  }

  const password = await new Promise<string>((resolve) => {
    rl.question("请输入管理员密码 (默认: admin123): ", (ans) => {
      resolve(ans.trim() || "admin123");
    });
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  console.log("\n✅ 管理员账号创建成功!");
  console.log(`用户名: ${admin.username}`);
  console.log(`密码: ${password}`);
  console.log(`角色: ${admin.role}`);
  console.log(`创建时间: ${admin.createdAt.toLocaleString("zh-CN")}`);
  console.log("\n请妥善保管账号信息，使用该账号登录后可以创建其他用户。");

  rl.close();
}

main()
  .catch((e) => {
    console.error("初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
