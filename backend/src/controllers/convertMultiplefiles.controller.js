import {
  convertAndSaveFile,
  createZipArchive,
} from "../utils/convert.utility.js";
import { cleanupFiles } from "../utils/file.utility.js";
import path from "path";

const convertMultipleFiles = async (req, res) => {
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

    req.files.forEach((f) => filesToCleanup.push(f.path));

    const convertedFiles = await Promise.all(
      req.files.map((file, i) => convertAndSaveFile(file, formats[i]))
    );

    const zipFilePath = await createZipArchive(
      convertedFiles.map((filePath) => ({ path: filePath }))
    );

    res.json({
      success: true,
      downloadUrl: `/api/files/${path.basename(zipFilePath)}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Batch conversion failed", details: error.message });
  } finally {
    await cleanupFiles(filesToCleanup);
  }
};

export default convertMultipleFiles;
