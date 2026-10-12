/* ------------------------------------------------------------------ */
/*  Seed script — demo staff accounts for the admin panel.             */
/*  Idempotent: creates missing accounts, never overwrites existing    */
/*  passwords/roles (so a customized install is never reverted).       */
/*  Run: bunx tsx scripts/seed-admin-users.ts                          */
/* ------------------------------------------------------------------ */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

const DEMO_ACCOUNTS: {
  username: string;
  displayName: string;
  password: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
}[] = [
  {
    username: "admin",
    displayName: "Clinic Owner",
    password: "Aristocrat#2026",
    role: "OWNER",
  },
  {
    username: "editor",
    displayName: "Content Editor",
    password: "Editor#2026",
    role: "EDITOR",
  },
  {
    username: "frontdesk",
    displayName: "Front Desk",
    password: "Frontdesk#2026",
    role: "VIEWER",
  },
];

async function main() {
  for (const acc of DEMO_ACCOUNTS) {
    const existing = await db.adminUser.findUnique({ where: { username: acc.username } });
    if (existing) {
      console.log(`• ${acc.username} (${existing.role}) — already exists, skipped`);
      continue;
    }
    await db.adminUser.create({
      data: {
        username: acc.username,
        displayName: acc.displayName,
        role: acc.role,
        passwordHash: hashPassword(acc.password),
        active: true,
      },
    });
    console.log(`✓ ${acc.username} (${acc.role}) created — password: ${acc.password}`);
  }

  const total = await db.adminUser.count();
  console.log(`\nAdmin accounts in database: ${total}`);
  console.log("Demo logins (test setup):");
  console.log("  OWNER   → admin / Aristocrat#2026");
  console.log("  EDITOR  → editor / Editor#2026");
  console.log("  VIEWER  → frontdesk / Frontdesk#2026");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
