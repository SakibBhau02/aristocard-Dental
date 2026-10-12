import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  guard,
  readJson,
  bad,
  notFound,
  serverError,
  ok,
  s,
  os,
  b,
  clampLen,
} from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — staff account management (OWNER only)                  */
/*  GET    /api/admin/users            → list accounts (no hashes)     */
/*  POST   /api/admin/users            → create (no id) / update (id)  */
/*         body: { id?, username?, displayName, role, active?,         */
/*                 password? (create: required; update: optional) }    */
/*  DELETE /api/admin/users?id=…       → remove account                */
/*  Business rule: the clinic must always keep ≥1 active OWNER.       */
/*  (Access control itself is enforced centrally in requireAdminRole:  */
/*   /api/admin/users is OWNER-only for every method.)                 */
/* ------------------------------------------------------------------ */

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9.-]{1,38}[a-z0-9])$/;

function safeUser(u: {
  id: string;
  username: string;
  displayName: string;
  role: string;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    active: u.active,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const rows = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    return NextResponse.json({ users: rows.map(safeUser) });
  } catch (err) {
    return serverError("users", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    const id = os(body.id);
    const displayName = clampLen(s(body.displayName).trim(), 80);
    if (displayName.length < 3) return bad("Display name must be at least 3 characters.");

    const role = s(body.role).toUpperCase();
    if (!["OWNER", "EDITOR", "VIEWER"].includes(role)) {
      return bad("Role must be OWNER, EDITOR or VIEWER.");
    }

    if (id) {
      /* ---------- update ---------- */
      const existing = await db.adminUser.findUnique({ where: { id } });
      if (!existing) return notFound("No staff account found with that id.");

      const password = s(body.password);
      if (password && password.length < 8) {
        return bad("New password must be at least 8 characters.");
      }

      const active = b(body.active, existing.active);
      if ((existing.role === "OWNER" && role !== "OWNER") || (existing.role === "OWNER" && !active)) {
        const ownersLeft = await db.adminUser.count({
          where: { role: "OWNER", active: true, NOT: { id } },
        });
        if (ownersLeft === 0) {
          return bad("The clinic must keep at least one active Owner account.");
        }
      }

      const row = await db.adminUser.update({
        where: { id },
        data: {
          displayName,
          role,
          active,
          ...(password ? { passwordHash: hashPassword(password) } : {}),
        },
      });
      return ok(req, { user: safeUser(row), id }, `Account “${row.username}” updated.`);
    }

    /* ---------- create ---------- */
    const username = s(body.username).trim().toLowerCase();
    if (!USERNAME_RE.test(username)) {
      return bad("Username must be 3-40 characters: lowercase letters, numbers, dots or hyphens.");
    }
    const password = s(body.password);
    if (password.length < 8) {
      return bad("Password must be at least 8 characters.");
    }
    const taken = await db.adminUser.findUnique({ where: { username } });
    if (taken) return bad("That username is already taken.");

    const row = await db.adminUser.create({
      data: {
        username,
        displayName,
        role,
        passwordHash: hashPassword(password),
        active: true,
      },
    });
    return ok(req, { user: safeUser(row), id: row.id }, `Account “${row.username}” created.`);
  } catch (err) {
    return serverError("users", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id")?.trim();
    if (!id) return bad("An account id is required.");

    const existing = await db.adminUser.findUnique({ where: { id } });
    if (!existing) return notFound("No staff account found with that id.");

    if (existing.role === "OWNER" && existing.active) {
      const ownersLeft = await db.adminUser.count({
        where: { role: "OWNER", active: true, NOT: { id } },
      });
      if (ownersLeft === 0) {
        return bad("The clinic must keep at least one active Owner account.");
      }
    }

    await db.adminUser.delete({ where: { id } });
    return ok(req, { id }, `Account “${existing.username}” removed.`);
  } catch (err) {
    return serverError("users", err);
  }
}
