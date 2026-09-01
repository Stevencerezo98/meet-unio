import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { AccessToken } from "livekit-server-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Endpoint API LiveKit Token
  app.get("/api/livekit/token", async (req, res) => {
    const room = req.query.room as string;
    const username = req.query.username as string;

    if (!room || !username) {
      res.status(400).json({ error: "Missing 'room' or 'username' parameter" });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl =
      process.env.LIVEKIT_URL ||
      process.env.VITE_LIVEKIT_URL ||
      process.env.LIVEKIT_WS_URL ||
      "";

    if (!apiKey || !apiSecret) {
      res.status(500).json({
        error: "Server is not configured with LIVEKIT_API_KEY and LIVEKIT_API_SECRET.",
        configured: false,
      });
      return;
    }

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: username,
        name: username,
        ttl: "6h",
      });

      at.addGrant({
        roomJoin: true,
        room: room,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();
      res.json({ token, wsUrl, configured: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generating token";
      res.status(500).json({ error: message, configured: false });
    }
  });

  // Endpoint API Config
  app.get("/api/livekit/config", (_req, res) => {
    const configured = Boolean(
      process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET
    );
    const wsUrl =
      process.env.LIVEKIT_URL ||
      process.env.VITE_LIVEKIT_URL ||
      process.env.LIVEKIT_WS_URL ||
      "";
    res.json({ configured, wsUrl });
  });

  // Entorno de desarrollo vs Producción
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Si corre desde dist/server.mjs toma la raíz, de lo contrario toma el directorio actual
    const rootDir = __dirname.endsWith("dist") ? path.resolve(__dirname, "..") : __dirname;
    const distPath = path.join(rootDir, "dist");

    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();