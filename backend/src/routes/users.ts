import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { hashPassword } from "../auth.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

const userSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  password: z.string().min(6).optional(),
  language: z.enum(["ar", "en"]).default("ar"),
  active: z.boolean().default(true),
  accountId: z.number().optional().nullable(),
  role: z.enum(["Administrator", "User"]).default("User")
});

router.get("/", requireAuth, requirePermission("users:read"), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    include: { account: true }
  });

  return res.json({ data: users });
});

router.post("/", requireAuth, requirePermission("users:write"), async (req, res) => {
  const parse = userSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { password, ...rest } = parse.data;
  const passwordHash = password ? await hashPassword(password) : await hashPassword("ChangeMe123!");

  const created = await prisma.user.create({
    data: {
      ...rest,
      password: passwordHash
    }
  });

  return res.status(201).json({ data: created });
});

router.put("/:id", requireAuth, requirePermission("users:write"), async (req, res) => {
  const parse = userSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const userId = Number(req.params.id);
  const { password, ...rest } = parse.data;

  const data: Record<string, unknown> = { ...rest };
  if (password) {
    data.password = await hashPassword(password);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data
  });

  return res.json({ data: updated });
});

router.delete("/:id", requireAuth, requirePermission("users:write"), async (req, res) => {
  await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { active: false }
  });
  return res.status(204).send();
});

export default router;
