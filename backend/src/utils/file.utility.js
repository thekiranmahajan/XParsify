import fs from "fs/promises";
import path from "path";
import { __dirname, convertedDir } from "./dirname.js";

export const downloadFile = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(convertedDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      throw err;
    }
  });
};

export const cleanupFiles = async (files) => {
  for (const file of files) {
    try {
      if (file.includes("uploads")) {
        const stat = await fs.lstat(file);
        if (stat.isDirectory()) {
          await fs.rm(file, { recursive: true, force: true });
        } else {
          await fs.unlink(file);
        }
      }
    } catch (error) {
      console.error(`Error removing file ${file}:`, error);
    }
  }
};
