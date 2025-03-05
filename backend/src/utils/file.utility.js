import fs from "fs/promises";
import path from "path";
import { __dirname, convertedDir } from "./dirname.js";

export const downloadFile = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(convertedDir, filename);

  try {
    await fs.access(filePath);
    const mimeType = mime.lookup(filename) || "application/octet-stream";
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none';");
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file");
      }
    });
  } catch (error) {
    console.error("File not found:", error);
    res.status(404).send("File not found");
  }
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
