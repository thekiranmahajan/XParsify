import { convertFile, createZipArchive } from "../utils/convert.utility.js";
import { cleanupFiles } from "../utils/file.utility.js";
import path from "path";

export const convertSingle = async (req, res) => {
  const filesToCleanup = [];
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const file = req.file;
    const { format } = req.body;

    if (!format) {
      return res.status(400).json({ error: "No format specified" });
    }

    filesToCleanup.push(file.path);
    const outputPath = await convertFile(file, format);

    res.json({
      success: true,
      result: {
        file: file.originalname,
        downloadUrl: `/api/files/${path.basename(outputPath)}`,
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({
      error: "Conversion failed",
      details: error.message,
    });
  } finally {
    await cleanupFiles(filesToCleanup);
  }
};

export const convertBatch = async (req, res) => {
  const filesToCleanup = [];
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const formats = req.body.formats.split(",");
    if (formats.length !== req.files.length) {
      return res
        .status(400)
        .json({ error: "Formats count doesn't match files count" });
    }

    req.files.forEach((f) => filesToCleanup.push(f.path)); // Only add the uploaded files to cleanup

    const convertedFiles = await Promise.all(
      req.files.map((file, i) => convertFile(file, formats[i]))
    );

    const fileResponses = convertedFiles.map((filePath, index) => ({
      original: req.files[index].originalname,
      downloadUrl: `/api/files/${path.basename(filePath)}`,
    }));

    res.json({ success: true, convertedFiles: fileResponses });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Batch conversion failed", details: error.message });
  } finally {
    await cleanupFiles(filesToCleanup);
  }
};
