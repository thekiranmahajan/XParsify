import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

export const __dirname = dirname(dirname(fileURLToPath(import.meta.url)));
export const uploadsDir = join(__dirname, "uploads");
export const convertedDir = join(__dirname, "converted");

[uploadsDir, convertedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
