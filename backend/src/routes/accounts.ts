import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

const accountSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable()
});

router.get("/", requireAuth, requirePermission("accounts:read"), async (_req, res) => {
  const accounts = await prisma.account.findMany({ orderBy: { id: "desc" } });
  return res.json({ data: accounts });
});

router.post("/", requireAuth, requirePermission("accounts:write"), async (req, res) => {
  const parse = accountSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const account = await prisma.account.create({ data: parse.data });
  return res.status(201).json({ data: account });
});

router.put("/:id", requireAuth, requirePermission("accounts:write"), async (req, res) => {
  const parse = accountSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const account = await prisma.account.update({
    where: { id: Number(req.params.id) },
    data: parse.data
  });
  return res.json({ data: account });
});

router.delete("/:id", requireAuth, requirePermission("accounts:write"), async (req, res) => {
  await prisma.account.delete({ where: { id: Number(req.params.id) } });
  return res.status(204).send();
});

export default router;
