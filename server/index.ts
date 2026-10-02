import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 8787);

createApp().listen(port, () => {
  console.log(`🍼 Minik Tabak API http://localhost:${port}/api/health`);
});
