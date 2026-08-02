import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "default-secret-key-change-in-production"
);
const COOKIE_NAME = "auth_token";

export interface UserInfo {
  id: string;
  username: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(
  userId: string,
  rememberMe: boolean
): Promise<string> {
  const expiresAt = rememberMe
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // Session (1 day, will be cleared on browser close)

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? "7d" : "1d")
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  // Dynamically import prisma to avoid build issues
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) return null;
  return user as UserInfo;
}

export function setAuthCookie(token: string, rememberMe: boolean) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 : undefined, // 7 days in seconds
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
