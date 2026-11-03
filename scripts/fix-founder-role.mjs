import fs from "node:fs";

/* Correct the founder's role line everywhere it is still the legacy
   "BDS, MDS — Chief Dental Surgeon & Founder" (MDS is not one of her
   qualifications; the public record shows BDS, PGT (OMFS), FCPS and the
   WFO fellowship). */

const ROLE_EN = "Founder & Chief Consultant — FCPS (Orthodontics), WFO Fellow (USA)";
const ROLE_BN = "প্রতিষ্ঠাতা ও চিফ কনসালট্যান্ট — এফসিপিএস (অর্থোডন্টিকস), ডব্লিউএফও ফেলো (যুক্তরাষ্ট্র)";

const dictPath = "src/lib/data/dictionary.ts";
let dict = fs.readFileSync(dictPath, "utf8");
const before = dict;
dict = dict.replace(
  /founderRole: "BDS, MDS — Chief Dental Surgeon & Founder"/,
  `founderRole: ${JSON.stringify(ROLE_EN)}`
);
if (dict === before) {
  console.log("dict: role string not found (already updated?)");
} else {
  fs.writeFileSync(dictPath, dict, "utf8");
  console.log("dict updated");
}

const { PrismaClient } = await import("@prisma/client");
const db = new PrismaClient();
const block = await db.pageBlock.findUnique({ where: { key: "about" } });
if (!block) {
  console.log("no about block in DB");
} else {
  const data = JSON.parse(block.dataJson);
  data.founderRole = ROLE_EN;
  data.founderRoleBn = ROLE_BN;
  await db.pageBlock.update({
    where: { key: "about" },
    data: { dataJson: JSON.stringify(data) },
  });
  console.log("DB about.founderRole =", data.founderRole);
}
await db.$disconnect();
