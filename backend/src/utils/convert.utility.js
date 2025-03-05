import fs from "fs";
import path from "path";
import archiver from "archiver";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { convertedDir } from "./dirname.js";
import parseXLF from "./parseXLF.utility.js";
import parseWord from "./parseWord.utility.js";
import {
  FORMATS_EXTENSIONS,
  processExtractedTexts,
  writeLogToFile,
} from "./constants.utility.js";

export const convertXLFToWord = async (filePath, outputPath) => {
  const extractedTexts = await parseXLF(filePath);
  console.log(extractedTexts);
  const filteredTexts = processExtractedTexts(extractedTexts);

  const doc = new Document({
    sections: [
      {
        children: filteredTexts.flatMap((entry) => {
          const idParts = entry.id.split("|");
          const lastId = idParts[idParts.length - 1];

          const sourceTextRun =
            lastId === "title"
              ? new TextRun({ text: entry.source, bold: true })
              : new TextRun({ text: entry.source });

          const targetTextRun = entry.target
            ? new TextRun({ text: entry.target, italics: true })
            : null;

          const paragraphs = [
            new Paragraph({
              children: [sourceTextRun],
            }),
          ];

          if (targetTextRun) {
            paragraphs.push(
              new Paragraph({
                children: [targetTextRun],
              })
            );
          }

          paragraphs.push(new Paragraph({ text: "" }));

          return paragraphs;
        }),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.promises.writeFile(outputPath, buffer);
};

export const convertXLFToCSV = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseXLF(filePath);
    const filteredData = processExtractedTexts(extractedTexts).map((entry) => {
      const result = {};
      if (entry.source) result.source = entry.source;
      if (entry.target) result.target = entry.target;
      return result;
    });
    const csvContent = await parseAsync(filteredData, {
      fields: ["source", "target"],
    });
    await fs.promises.writeFile(outputPath, csvContent);
    return outputPath;
  } catch (error) {
    console.error("Error converting to CSV:", error);
    throw error;
  }
};

export const convertXLFToExcel = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseXLF(filePath);
    const filteredData = processExtractedTexts(extractedTexts);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Translations");
    worksheet.columns = [
      { header: "Source", key: "source", width: 30 },
      { header: "Target", key: "target", width: 30 },
    ];

    filteredData.forEach((entry) => worksheet.addRow(entry));

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
      column.alignment = { wrapText: true };
    });

    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error("Error converting to Excel:", error);
    throw error;
  }
};

export const convertXLFToText = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseXLF(filePath);
    const filteredTexts = processExtractedTexts(extractedTexts);

    const textContent = filteredTexts
      .map((entry) => {
        let result = "";
        if (entry.source) result += `${entry.source}\n`;
        if (entry.target) result += `${entry.target}\n`;
        return result.trim();
      })
      .join("\n\n");

    await fs.promises.writeFile(outputPath, textContent);
    return outputPath;
  } catch (error) {
    console.error("Error converting to Text:", error);
    throw error;
  }
};

export const convertXLFToJSON = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseXLF(filePath);
    const filteredTexts = processExtractedTexts(extractedTexts);

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(filteredTexts, null, 2)
    );
    return outputPath;
  } catch (error) {
    console.error("Error converting to JSON:", error);
    throw error;
  }
};

export const convertWordToText = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseWord(filePath);

    const textContent = extractedTexts
      .map((entry) => `${entry.lesson}\n\n${entry.notes}`)
      .join("\n\n");

    await fs.promises.writeFile(outputPath, textContent);
    await writeLogToFile(extractedTexts, "convertWordToText");
    return outputPath;
  } catch (error) {
    console.error("Error converting to Text:", error);
    throw error;
  }
};

export const convertWordToCSV = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseWord(filePath);
    const csvContent = await parseAsync(extractedTexts, {
      fields: ["lesson", "notes"],
    });
    await fs.promises.writeFile(outputPath, csvContent);
    await writeLogToFile(extractedTexts, "convertWordToCSV");
    return outputPath;
  } catch (error) {
    console.error("Error converting to CSV:", error);
    throw error;
  }
};

export const convertWordToExcel = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseWord(filePath);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Notes");
    worksheet.columns = [
      { header: "Lesson", key: "lesson", width: 30 },
      { header: "Notes", key: "notes", width: 50 },
    ];

    extractedTexts.forEach((entry) => worksheet.addRow(entry));

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
      column.alignment = { wrapText: true };
    });

    await workbook.xlsx.writeFile(outputPath);
    await writeLogToFile(extractedTexts, "convertWordToExcel");
    return outputPath;
  } catch (error) {
    console.error("Error converting to Excel:", error);
    throw error;
  }
};

export const convertWordToJSON = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseWord(filePath);

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(extractedTexts, null, 2)
    );
    await writeLogToFile(extractedTexts, "convertWordToJSON");
    return outputPath;
  } catch (error) {
    console.error("Error converting to JSON:", error);
    throw error;
  }
};

export const convertWordToWord = async (filePath, outputPath) => {
  try {
    const extractedTexts = await parseWord(filePath);

    const doc = new Document({
      sections: [
        {
          children: extractedTexts.flatMap((entry) => [
            new Paragraph({
              children: [new TextRun({ text: entry.lesson, bold: true })],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: entry.notes }),
            new Paragraph({ text: "" }),
          ]),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    await fs.promises.writeFile(outputPath, buffer);
    await writeLogToFile(extractedTexts, "convertWordToWord");
    return outputPath;
  } catch (error) {
    console.error("Error converting to Word:", error);
    throw error;
  }
};

export const createZipArchive = async (files) => {
  const finalPath = path.join(convertedDir, `batch-${Date.now()}.zip`);
  const output = fs.createWriteStream(finalPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve(finalPath));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    files.forEach((file) => {
      archive.file(file.path, { name: path.basename(file.path) });
    });

    archive.finalize();
  });
};

export const convertAndSaveFile = async (file, format) => {
  try {
    const extension = FORMATS_EXTENSIONS[format.toUpperCase()];
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

    if (file.originalname.endsWith(".xlf")) {
      switch (format.toUpperCase()) {
        case "WORD":
          await convertXLFToWord(file.path, outputPath);
          break;
        case "CSV":
          await convertXLFToCSV(file.path, outputPath);
          break;
        case "EXCEL":
          await convertXLFToExcel(file.path, outputPath);
          break;
        case "TEXT":
          await convertXLFToText(file.path, outputPath);
          break;
        case "JSON":
          await convertXLFToJSON(file.path, outputPath);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } else {
      switch (format.toUpperCase()) {
        case "WORD":
          await convertWordToWord(file.path, outputPath);
          break;
        case "CSV":
          await convertWordToCSV(file.path, outputPath);
          break;
        case "EXCEL":
          await convertWordToExcel(file.path, outputPath);
          break;
        case "TEXT":
          await convertWordToText(file.path, outputPath);
          break;
        case "JSON":
          await convertWordToJSON(file.path, outputPath);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    }

    return outputPath;
  } catch (error) {
    console.error("Conversion error:", error);
    throw error;
  }
};
