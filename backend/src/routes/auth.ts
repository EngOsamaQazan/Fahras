import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { buildUserContext, hashPassword, isBcryptHash, issueToken, verifyPassword } from "../auth.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { username, password } = parse.data;
  const user = await prisma.user.findFirst({ where: { username } });

  if (!user || !user.active) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.password && !isBcryptHash(user.password)) {
    const upgraded = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: upgraded }
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  const token = issueToken(user.id);
  const context = await buildUserContext(user.id);

  return res.json({
    token,
    user: context
  });
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
