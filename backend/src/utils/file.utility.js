import fs from "fs/promises";
import xml2js from "xml2js";
import mammoth from "mammoth";
import path from "path";
import { __dirname, convertedDir } from "./dirname.js";

export const parseXLF = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  const parser = new xml2js.Parser();
  const jsonData = await parser.parseStringPromise(data);

  return jsonData.xliff.file[0].body[0]["trans-unit"].map((unit) => ({
    id: unit.$.id,
    source: unit.source[0],
    target: unit.target ? unit.target[0] : "NA",
  }));
};

export const parseWordFile = async (filePath) => {
  const { value: extractedText } = await mammoth.extractRawText({
    path: filePath,
  });
  return extractedText;
};

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
      // Only remove files from the uploads directory
      if (file.includes("uploads")) {
        await fs.unlink(file);
      }
    } catch (error) {
      console.error(`Error removing file ${file}:`, error);
    }
  }
};
