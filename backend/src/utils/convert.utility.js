import fs from "fs";
import path from "path";
import archiver from "archiver";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import {
  parseXLF,
  parseWordFile,
  convertXLFToWord,
  cleanJsonData,
} from "./file.utility.js";
import { convertedDir } from "./dirname.js";

const formatExtensions = {
  TEXT: "txt",
  CSV: "csv",
  JSON: "json",
  EXCEL: "xlsx",
  WORD: "docx",
};

export const convertToCSV = async (data) => {
  try {
    const filteredData = data.map((entry) => {
      const result = {};
      if (entry.source) result.source = entry.source;
      if (entry.target) result.target = entry.target;
      return result;
    });
    return await parseAsync(filteredData, { fields: ["source", "target"] });
  } catch (error) {
    console.error("Error converting to CSV:", error);
    throw error;
  }
};

export const convertToExcel = async (data, filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Translations");
    worksheet.columns = [
      { header: "Source", key: "source", width: 30 },
      { header: "Target", key: "target", width: 30 },
    ];

    data.forEach((entry) => worksheet.addRow(entry));
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error("Error converting to Excel:", error);
    throw error;
  }
};

export const convertToWord = async (data, filePath) => {
  try {
    const doc = new Document({
      sections: [
        {
          children: data.map((entry) => {
            const children = [];
            if (entry.source) {
              children.push(
                new TextRun({
                  text: `${entry.source}`,
                  break: 1,
                })
              );
            }
            if (entry.target) {
              children.push(
                new TextRun({
                  text: `${entry.target}`,
                  break: 1,
                })
              );
            }
            return new Paragraph({ children });
          }),
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch (error) {
    console.error("Error converting to Word:", error);
    throw error;
  }
};

export const convertToText = async (data, filePath) => {
  try {
    const textContent = data
      .map((entry) => {
        let result = "";
        if (entry.source) result += `${entry.source}\n`;
        if (entry.target) result += `${entry.target}\n`;
        return result.trim();
      })
      .join("\n\n");
    await fs.promises.writeFile(filePath, textContent);
    return filePath;
  } catch (error) {
    console.error("Error converting to Text:", error);
    throw error;
  }
};

export const createZipArchive = async (files) => {
  const finalPath = path.join(convertedDir, `batch-${Date.now()}.zip`);
  const output = fs.createWriteStream(finalPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);

  files.forEach((file) => {
    archive.file(file.path, { name: path.basename(file.path) });
  });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve(finalPath));
    archive.finalize();
  });
};

export const convertFile = async (file, format) => {
  try {
    const extension = formatExtensions[format.toUpperCase()];
    if (!extension) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const outputPath = path.join(
      convertedDir,
      `${path.parse(file.originalname).name}.${extension}`
    );

    console.log("Processing file:", file.originalname);
    console.log("Target format:", format);
    console.log("Output path:", outputPath);

    let fileContent;
    try {
      if (file.originalname.endsWith(".xlf")) {
        if (format.toUpperCase() === "WORD") {
          await convertXLFToWord(file.path, outputPath);
          return outputPath;
        } else {
          fileContent = await parseXLF(file.path);
        }
      } else {
        fileContent = await parseWordFile(file.path);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }

    const cleanedData = cleanJsonData(fileContent);

    let result;
    switch (format.toUpperCase()) {
      case "TEXT":
        result = await convertToText(cleanedData, outputPath);
        break;

      case "CSV":
        const csvContent = await convertToCSV(cleanedData);
        await fs.promises.writeFile(outputPath, csvContent);
        result = outputPath;
        break;

      case "JSON":
        await fs.promises.writeFile(
          outputPath,
          JSON.stringify(cleanedData, null, 2)
        );
        result = outputPath;
        break;

      case "EXCEL":
        result = await convertToExcel(cleanedData, outputPath);
        break;

      case "WORD":
        result = await convertToWord(cleanedData, outputPath);
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return result;
  } catch (error) {
    console.error("Conversion error:", error);
    throw error;
  }
};
