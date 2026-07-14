import { defineConfig, loadEnv } from "vite";
import { buildXDC, eruda, mockWebxdc } from "@webxdc/vite-plugins";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      buildXDC(),
      eruda(),
      mockWebxdc(),
      {
        name: "update-manifest",
        closeBundle() {
          const manifestPath = path.resolve(__dirname, "public/manifest.toml");
          let content = fs.readFileSync(manifestPath, "utf-8");
          const chestNumber = env.VITE_CHEST_NUMBER || "???";
          content = content.replace(/{{VITE_CHEST_NUMBER}}/g, chestNumber);
          const destPath = path.resolve(__dirname, "dist/manifest.toml");
          fs.writeFileSync(destPath, content);
        },
      },
    ],
  };
});
