import { db } from "./src/lib/db";
const ev = await db.trackingEvent.findFirst({ where: { type: "appointment_rescheduled" }, orderBy: { createdAt: "desc" } });
console.log("tracking event:", ev?.type, ev?.label, ev?.metaJson);
await db.$disconnect();
