import { db } from "./src/lib/db";
const rows = await db.adminActivity.findMany({ where: { entity: "appointments" }, orderBy: { createdAt: "desc" }, take: 3 });
for (const r of rows) console.log(r.actor, "|", r.action, "|", r.label);
await db.$disconnect();
