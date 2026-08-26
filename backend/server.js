import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "dsa-mentor-backend" });
});

app.use("/api/ai", aiRoutes);

app.listen(port, () => {
  console.log(`DSA Mentor backend running on http://localhost:${port}`);
});