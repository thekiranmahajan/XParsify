import { parseXLF } from "../utils/file.utility.js";
import {
  convertToCSV,
  convertToExcel,
  convertToWord,
} from "../utils/convert.utility.js";
import path from "path";
import fs from "fs";

export const processXLF = async (req, res) => {
  try {
    const files = req.files;
    const format = req.body.format;
    const results = [];

    console.log(`Received ${files.length} files for conversion to ${format}`);

    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
      const data = await parseXLF(file.path);
      let filePath;
      switch (format) {
        case "csv":
          const csvData = await convertToCSV(data);
          filePath = path.join("uploads", `${file.originalname}.csv`);
          fs.writeFileSync(filePath, csvData);
          break;
        case "xlxs":
          filePath = await convertToExcel(data);
          break;
        case "word":
          filePath = await convertToWord(data);
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
