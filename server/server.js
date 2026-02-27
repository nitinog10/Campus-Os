import "dotenv/config";
import express from "express";
import cors from "cors";
import { interpretRouter } from "./routes/interpret.js";
import { pipelineRouter } from "./routes/pipeline.js";
import { assetRouter } from "./routes/asset.js";
import { generateRouter } from "./routes/generate.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json({ limit: "10mb" }));

// New consolidated endpoint
app.use("/api", generateRouter);

// Legacy endpoints (kept for backwards compatibility)
app.use("/api", interpretRouter);
app.use("/api", pipelineRouter);
app.use("/api", assetRouter);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🚀 CampusOS API server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
