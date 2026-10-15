import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/* ------------------------------------------------------------------ */
/*  Password hashing — shared by Patient and AdminUser accounts.       */
/*  Format: "scrypt:<saltHex>:<hashHex>" with a per-password salt.     */
/*  Verification is constant-time (no length/timing leaks).            */
/* ------------------------------------------------------------------ */

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384; // N — standard "interactive" strength

/** Hash a plaintext password → "scrypt:<saltHex>:<hashHex>". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST });
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Constant-time password verification against a stored scrypt hash. */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const parts = stored.split(":");
    if (parts.length !== 3 || parts[0] !== "scrypt") return false;
    const salt = Buffer.from(parts[1], "hex");
    const expected = Buffer.from(parts[2], "hex");
    if (salt.length === 0 || expected.length !== SCRYPT_KEYLEN) return false;
    const actual = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST });
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
