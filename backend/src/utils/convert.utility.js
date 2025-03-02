import fs from "fs";
import path from "path";
import archiver from "archiver";
import { parseAsync } from "json2csv";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { parseXLF, parseWordFile } from "./file.utility.js";
import { convertedDir } from "./dirname.js";

export const convertToCSV = async (data) => {
  try {
    return await parseAsync(data, { fields: ["id", "source", "target"] });
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
      { header: "ID", key: "id", width: 10 },
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
          children: data.map(
            (entry) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${entry.id}: ${entry.source} -> ${entry.target}`,
                    break: 1,
                  }),
                ],
              })
          ),
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
    const outputPath = path.join(
      convertedDir,
      `${path.parse(file.originalname).name}.${format.toLowerCase()}`
    );

    console.log("Processing file:", file.originalname);
    console.log("Target format:", format);
    console.log("Output path:", outputPath);

    let fileContent;
    try {
      fileContent = file.originalname.endsWith(".xlf")
        ? await parseXLF(file.path)
        : await parseWordFile(file.path);
    } catch (error) {
      console.error("Error parsing file:", error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }

    let result;
    switch (format.toUpperCase()) {
      case "TEXT":
        const textContent =
          typeof fileContent === "string"
            ? fileContent
            : JSON.stringify(fileContent, null, 2);
        await fs.promises.writeFile(outputPath, textContent);
        result = outputPath;
        break;

      case "CSV":
        const csvContent = await convertToCSV(fileContent);
        await fs.promises.writeFile(outputPath, csvContent);
        result = outputPath;
        break;

      case "JSON":
        await fs.promises.writeFile(
          outputPath,
          JSON.stringify(fileContent, null, 2)
        );
        result = outputPath;
        break;

      case "EXCEL":
        result = await convertToExcel(fileContent, outputPath);
        break;

      case "WORD":
        result = await convertToWord(fileContent, outputPath);
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
