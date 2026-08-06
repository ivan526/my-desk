import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const KEY_PREFIX = "wap_";
const KEY_LENGTH = 32;

export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const randomBytes = crypto.randomBytes(KEY_LENGTH).toString("hex");
  const rawKey = `${KEY_PREFIX}${randomBytes}`;
  const keyHash = bcrypt.hashSync(rawKey, 10);
  const keyPrefix = `${KEY_PREFIX}${randomBytes.slice(0, 8)}...`;
  return { rawKey, keyHash, keyPrefix };
}

export async function verifyApiKey(rawKey: string): Promise<{ userId: string; keyId: string } | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  // Find all keys and check hash (we don't index by hash, acceptable for small user base)
  // For production, we can index by prefix first
  const keys = await prisma.apiKey.findMany();
  for (const key of keys) {
    try {
      if (bcrypt.compareSync(rawKey, key.key)) {
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });
        return { userId: key.userId, keyId: key.id };
      }
    } catch {
      continue;
    }
  }
  return null;
}
