import { NextRequest } from "next/server";

export function getUserId(req: NextRequest): string | null {
  return req.headers.get("x-user-id");
}

export function requireUserId(req: NextRequest): string {
  const userId = getUserId(req);
  if (!userId) {
    throw new Error("未授权");
  }
  return userId;
}
