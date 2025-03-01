import { parseWordFile } from "../utils/file.utility.js";
import {
  convertToCSV,
  convertToExcel,
  convertToWord,
} from "../utils/convert.utility.js";
import path from "path";
import fs from "fs";

export const parseWord = async (req, res) => {
  try {
    const files = req.files;
    const format = req.body.format;
    const results = [];

    console.log(`Received ${files.length} files for conversion to ${format}`);

    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
      const text = await parseWordFile(file.path);
      let filePath;
      const fileNameWithoutExt = path.parse(file.originalname).name;
      switch (format) {
        case "csv":
          const csvData = await convertToCSV([{ text }]);
          filePath = path.join("uploads", `${fileNameWithoutExt}.csv`);
          fs.writeFileSync(filePath, csvData);
          break;
        case "xlsx":
          filePath = path.join("uploads", `${fileNameWithoutExt}.xlsx`);
          await convertToExcel([{ text }], filePath);
          break;
        case "word":
          filePath = path.join("uploads", `${fileNameWithoutExt}.docx`);
          await convertToWord([{ text }], filePath);
          break;
        // Add other formats as needed
        default:
          throw new Error("Unsupported format");
      }
      results.push({
        file: file.originalname,
        filePath: `/uploads/${path.basename(filePath)}`,
      });
    }

    console.log("Conversion results:", results);

    res.json({
      message: "Files processed successfully!",
      results,
    });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({ error: error.message });
  }
};
