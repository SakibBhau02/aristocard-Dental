import { db } from "./src/lib/db";
const rows = await db.appointment.findMany({ select: { refCode: true, name: true, phone: true, date: true, status: true, source: true }, orderBy: { createdAt: "desc" }, take: 15 });
for (const r of rows) console.log(r.refCode, "|", r.name, "|", r.phone, "|", r.date, "|", r.status, "|", r.source);
await db.$disconnect();
