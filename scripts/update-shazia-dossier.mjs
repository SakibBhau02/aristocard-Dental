import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const education = [
  { degree: "BDS", institution: "Rajshahi Medical College", year: "2002–2007" },
  { degree: "PGT — Oral & Maxillofacial Surgery", institution: "Dhaka Dental College" },
  { degree: "FCPS (Orthodontics)", institution: "Bangladesh College of Physicians & Surgeons (BCPS)" },
  { degree: "Fellow, World Federation of Orthodontists", institution: "World Federation of Orthodontists (WFO), USA" },
];

const credentials = ["BDS", "PGT (OMFS)", "FCPS (Orthodontics)", "Fellow — WFO"];

const bio =
  "At the heart of Aristocrat Dental Care is Dr. Shazia Khanam, founder and Chief Consultant — an orthodontist with more than eighteen years of clinical experience. Trained at Rajshahi Medical College (BDS), Dhaka Dental College (PGT, Oral & Maxillofacial Surgery) and the Bangladesh College of Physicians & Surgeons (FCPS, Orthodontics), and a Fellow of the World Federation of Orthodontists (USA), she leads the clinic's standard of clinical excellence. Her philosophy: “A healthy smile is a gateway to overall well-being.”";

const row = await db.doctor.findFirst({ where: { slug: "dr-shazia-khanam" } });
if (!row) {
  console.log("NOT FOUND");
  process.exit(1);
}

const updated = await db.doctor.update({
  where: { id: row.id },
  data: {
    credentialsJson: JSON.stringify(credentials),
    bio,
    experienceYears: 18,
    educationJson: JSON.stringify(education),
    membershipsJson: JSON.stringify(["World Federation of Orthodontists (WFO) — Fellow"]),
    awardsJson: JSON.stringify([
      { title: "FDI World Dental Congress 2025 — Delegate, Shanghai", year: "2025" },
    ]),
  },
});

console.log("UPDATED", updated.slug, updated.experienceYears, updated.credentialsJson);
await db.$disconnect();
