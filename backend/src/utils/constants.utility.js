import fs from "fs";
import path from "path";
import { backendSrcDir } from "./dirname.js";

export const FORMATS_EXTENSIONS = {
  TEXT: "txt",
  CSV: "csv",
  JSON: "json",
  EXCEL: "xlsx",
  WORD: "docx",
};

export const processExtractedTexts = (extractedTexts) => {
  return extractedTexts.filter(
    (entry) =>
      (entry.source && entry.source.trim().length > 0) ||
      (entry.target && entry.target.trim().length > 0)
  );
};

export const writeLogToFile = async (logData, logType) => {
  const logFilePath = path.join(backendSrcDir, `logs/${logType}.log`);
  await fs.promises.writeFile(
    logFilePath,
    JSON.stringify(logData, null, 2) + "\n"
  );
};

export const SENTENCES_TO_IGNORE = [
  "Select START MODULE to begin. Be sure to click on the interactive elements to advance.",
  "Please look at these important terms.",
  'Select "+" to expand.',
  "CONTINUE",
  "Complete the content above before moving on.",
  "Choose the best option and select SUBMIT.",
  "Select each request to view the matching right.",
  "Scroll through each section to view the text.",
];
