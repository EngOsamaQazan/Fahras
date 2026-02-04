import "./types.js";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import accountsRoutes from "./routes/accounts.js";
import clientsRoutes from "./routes/clients.js";
import attachmentsRoutes from "./routes/attachments.js";
import searchRoutes from "./routes/search.js";
import importsRoutes from "./routes/imports.js";
import translationsRoutes from "./routes/translations.js";
import externalSourcesRoutes from "./routes/external-sources.js";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/accounts", accountsRoutes);
app.use("/companies", accountsRoutes);
app.use("/clients", clientsRoutes);
app.use("/attachments", attachmentsRoutes);
app.use("/search", searchRoutes);
app.use("/imports", importsRoutes);
app.use("/translations", translationsRoutes);
app.use("/external-sources", externalSourcesRoutes);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${config.port}`);
});
