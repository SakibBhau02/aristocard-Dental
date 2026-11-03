import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const row = await db.doctor.update({
  where: { slug: "dr-shazia-khanam" },
  data: {
    focusServicesJson: JSON.stringify([
      "invisalign-clear-aligners",
      "traditional-braces-orthodontics",
      "digital-smile-design",
      "porcelain-veneers",
    ]),
  },
});
console.log("focusServices =", row.focusServicesJson);
await db.$disconnect();
