import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const backendSrcDir = dirname(__dirname);
export const backendDir = dirname(backendSrcDir);
export const rootDir = dirname(backendDir);
export const frontendDistDir = resolve(rootDir, "frontend", "dist");

export const uploadsDir = join(backendSrcDir, "uploads");
export const convertedDir = join(backendSrcDir, "converted");

[uploadsDir, convertedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
