import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  schedulerInitialized?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Initialize scheduler when not in build/edge runtime
if (
  process.env.NODE_ENV !== "production" &&
  !globalForPrisma.schedulerInitialized &&
  typeof window === "undefined" &&
  process.env.NEXT_RUNTIME !== "edge"
) {
  // Only initialize in dev after server starts, avoid initializing during build
  setTimeout(async () => {
    try {
      const { initScheduler } = await import("./cli/scheduler");
      await initScheduler();
      globalForPrisma.schedulerInitialized = true;
    } catch (e) {
      console.log("CLI scheduler will initialize after server starts");
    }
  }, 2000);
}

// Initialize in production
if (process.env.NODE_ENV === "production" && !globalForPrisma.schedulerInitialized) {
  setTimeout(async () => {
    try {
      const { initScheduler } = await import("./cli/scheduler");
      await initScheduler();
      globalForPrisma.schedulerInitialized = true;
    } catch (e) {
      console.error("Failed to initialize CLI scheduler:", e);
    }
  }, 2000);
}
