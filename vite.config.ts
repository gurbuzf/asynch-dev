import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `--mode artifact`: sunucusuz, tek dosyalık derleme (Claude Artifact / statik barındırma)
export default defineConfig(({ mode }) => {
  const artifact = mode === "artifact";
  return {
    root: "client",
    plugins: [react(), tailwindcss()],
    define: artifact ? { "import.meta.env.VITE_STANDALONE": JSON.stringify("1") } : {},
    build: {
      outDir: artifact ? "../dist-artifact" : "../dist",
      emptyOutDir: true,
      copyPublicDir: !artifact,
      rollupOptions: artifact ? { output: { inlineDynamicImports: true } } : {},
    },
    server: {
      port: 5173,
      proxy: {
        "/api": "http://localhost:8787",
      },
    },
  };
});
