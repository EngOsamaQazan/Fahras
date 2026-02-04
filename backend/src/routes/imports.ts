import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import xlsx from "xlsx";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const importSchema = z.object({
  accountId: z.coerce.number()
});

function parseSheet(buffer: Buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
  return rows;
}

router.post(
  "/clients",
  requireAuth,
  requirePermission("imports:write"),
  upload.single("file"),
  async (req, res) => {
    const parse = importSchema.safeParse(req.body);
    if (!parse.success || !req.file) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const user = req.user!;
    const { accountId } = parse.data;

    if (!user.isAdmin && user.accountId !== accountId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const rows = parseSheet(req.file.buffer);
    if (rows.length <= 1) {
      return res.status(400).json({ message: "No data rows found" });
    }

    let inserted = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row || row.length === 0) {
        continue;
      }

      const [
        name,
        contracts,
        nationalId,
        sellDate,
        work,
        homeAddress,
        workAddress,
        phone,
        status,
        courtStatus
      ] = row;

      if (!name || String(name).trim() === "") {
        continue;
      }

      if (nationalId) {
        const existing = await prisma.client.findFirst({
          where: {
            accountId,
            nationalId: String(nationalId)
          }
        });
        if (existing) {
          skipped += 1;
          continue;
        }
      }

      await prisma.client.create({
        data: {
          accountId,
          name: String(name),
          contracts: contracts ? String(contracts) : null,
          nationalId: nationalId ? String(nationalId) : null,
          sellDate: sellDate ? String(sellDate) : null,
          work: work ? String(work) : null,
          homeAddress: homeAddress ? String(homeAddress) : null,
          workAddress: workAddress ? String(workAddress) : null,
          phone: phone ? String(phone) : null,
          status: status ? String(status) : null,
          courtStatus: courtStatus ? String(courtStatus) : null
        }
      });
      inserted += 1;
    }

    return res.json({ inserted, skipped });
  }
);

export default router;
