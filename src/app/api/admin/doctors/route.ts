import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapDoctor } from "@/lib/content/shared";
import {
  guard, readJson, bad, notFound, serverError, ok,
  s, os, n, b, strList, validSlug, clamp, clampLen,
} from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Doctor management (full CRUD)                          */
/*  GET    /api/admin/doctors          → all doctors (incl. inactive)  */
/*  POST   /api/admin/doctors          → create (no id) / update (id)  */
/*  DELETE /api/admin/doctors?id=…     → remove                         */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const rows = await db.doctor.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ doctors: rows.map((r) => mapDoctor(r as unknown as Record<string, unknown>)) });
  } catch (err) {
    return serverError("doctors", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    const id = os(body.id);
    const name = clampLen(s(body.name).trim(), 120);
    if (name.length < 3) return bad("Doctor name must be at least 3 characters.");

    const slugInput = os(body.slug) ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = slugInput;
    if (!validSlug(slug)) return bad("Slug must be lowercase letters, numbers and hyphens (2-80 chars).");

    const role = clampLen(s(body.role).trim(), 150);
    if (role.length < 2) return bad("Role is required.");
    const department = clampLen(s(body.department).trim(), 150);
    if (department.length < 2) return bad("Department is required.");
    const bio = clampLen(s(body.bio).trim(), 4000);
    if (bio.length < 10) return bad("Bio must be at least 10 characters.");

    const data = {
      slug,
      legacyId: id ? undefined : n(body.legacyId, 0),
      sort: Math.round(clamp(n(body.sort, 0), 0, 9999)),
      name,
      credentialsJson: JSON.stringify(strList(body.credentials)),
      role,
      roleBn: os(body.roleBn),
      department,
      departmentBn: os(body.departmentBn),
      bio,
      experienceYears: Math.round(clamp(n(body.experienceYears, 1), 0, 80)),
      patientsTreated: Math.round(clamp(n(body.patientsTreated, 0), 0, 10_000_000)),
      rating: Math.round(clamp(n(body.rating, 4.8), 0, 5) * 10) / 10,
      specializationsJson: JSON.stringify(strList(body.specializations)),
      languagesJson: JSON.stringify(
        strList(body.languages).length ? strList(body.languages) : ["Bangla", "English"]
      ),
      consultationDaysJson: JSON.stringify(
        strList(body.consultationDays).filter((d) =>
          ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(d)
        )
      ),
      accent: /^#[0-9a-fA-F]{6}$/.test(s(body.accent)) ? s(body.accent) : "#012c5f",
      photo: os(body.photo),
      active: b(body.active, true),
    };

    if (id) {
      const existing = await db.doctor.findUnique({ where: { id } });
      if (!existing) return notFound("No doctor found with that id.");
      if (slug !== existing.slug) {
        const clash = await db.doctor.findUnique({ where: { slug } });
        if (clash && clash.id !== id) return bad("Another doctor already uses that slug.");
      }
      const row = await db.doctor.update({ where: { id }, data });
      return ok(req, { doctor: mapDoctor(row as unknown as Record<string, unknown>), id }, "Doctor updated.");
    }

    const clash = await db.doctor.findUnique({ where: { slug } });
    if (clash) return bad("A doctor with that slug already exists.");
    const row = await db.doctor.create({ data });
    return ok(req, { doctor: mapDoctor(row as unknown as Record<string, unknown>), id: row.id }, "Doctor created.");
  } catch (err) {
    return serverError("doctors", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) return bad("An ?id= query parameter is required.");
    const existing = await db.doctor.findUnique({ where: { id } });
    if (!existing) return notFound("No doctor found with that id.");
    await db.doctor.delete({ where: { id } });
    return ok(req, { id }, "Doctor deleted.");
  } catch (err) {
    return serverError("doctors", err);
  }
}
