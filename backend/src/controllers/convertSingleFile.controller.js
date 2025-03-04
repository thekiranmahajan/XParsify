import { convertAndSaveFile } from "../utils/convert.utility.js";
import { cleanupFiles } from "../utils/file.utility.js";
import path from "path";

const convertSingleFile = async (req, res) => {
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
    const outputPath = await convertAndSaveFile(file, format);

    res.json({
      success: true,
      result: {
        fileName: file.originalname,
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

export default convertSingleFile;
