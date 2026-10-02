import express, { type NextFunction, type Request, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { handleApi } from "../shared/api.ts";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  });

  app.get(/^\/api(\/.*)$/, (req, res) => {
    const { status, body, cacheSeconds } = handleApi(req.params[0], req.query);
    if (cacheSeconds) res.set("Cache-Control", `public, max-age=${cacheSeconds}`);
    res.status(status).json(body);
  });

  // Üretimde derlenmiş istemciyi sun (SPA)
  const dist = path.resolve(import.meta.dirname, "../dist");
  if (existsSync(dist)) {
    app.use(express.static(dist, { maxAge: "1h", index: false }));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(dist, "index.html"));
    });
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Beklenmeyen bir hata oluştu" });
  });

  return app;
}
