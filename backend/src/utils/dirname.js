import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import fs from "fs";

export const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
export const uploadsDir = join(__dirname, "uploads");
export const convertedDir = join(__dirname, "converted");

[uploadsDir, convertedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
export const rootDir = dirname(backendDir);
export const frontendDistDir = resolve(rootDir, "frontend", "dist");
