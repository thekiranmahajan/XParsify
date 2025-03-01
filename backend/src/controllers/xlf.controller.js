import { parseXLF } from "../utils/file.utility.js";
import {
  convertToCSV,
  convertToExcel,
  convertToWord,
} from "../utils/convert.utility.js";

export const processXLF = async (req, res) => {
  try {
    const data = await parseXLF(req.file.path);
    const csvData = await convertToCSV(data);
    const excelPath = convertToExcel(data);
    const wordPath = await convertToWord(data);

    res.json({
      message: "File processed successfully!",
      data,
      csvData,
      excelPath,
      wordPath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
