import { db } from "./src/lib/db";
const future = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
const appt = await db.appointment.create({
  data: {
    refCode: "ADC-QA16B01",
    name: "QA Test Patient",
    phone: "01700000001",
    date: future,
    time: "10:30 AM",
    doctorSlug: "dr-shazia-khanam",
    serviceSlug: "teeth-whitening",
    notes: "QA seeded booking",
    status: "PENDING",
    source: "WEBSITE",
  },
});
console.log("created:", appt.refCode, appt.date, appt.time);
await db.$disconnect();
