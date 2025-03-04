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
  await fs.promises.appendFile(
    logFilePath,
    JSON.stringify(logData, null, 2) + "\n"
  );
};
