import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { AccessToken } from "livekit-server-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/livekit/token", (req, res) => {
    const room = req.query.room as string;
    const username = req.query.username as string;

    if (!room || !username) {
      res.status(400).json({ error: "Missing 'room' or 'username' parameter" });
      return;
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      res.status(500).json({ error: "Server is not configured with LIVEKIT_API_KEY and LIVEKIT_API_SECRET." });
      return;
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
    });
    at.addGrant({ roomJoin: true, room: room });

    res.json({ token: at.toJwt() });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
