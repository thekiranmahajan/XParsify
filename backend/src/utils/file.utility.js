import fs from "fs/promises";
import xml2js from "xml2js";
import mammoth from "mammoth";
import path from "path";
import { __dirname, convertedDir } from "./dirname.js";
import { Document, Packer, Paragraph, TextRun } from "docx";

const writeLogToFile = async (logData, logType) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFilePath = path.join(__dirname, `logs/${logType}-${timestamp}.log`);
  await fs.writeFile(logFilePath, JSON.stringify(logData, null, 2));
};

const cleanText = (text) =>
  text
    .replace(/(\r\n|\n|\r)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTextRecursive = (node) => {
  if (!node) return "";
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node))
    return node.map(extractTextRecursive).join(" ").trim();
  if (typeof node === "object") {
    const texts = [];
    if (node._) texts.push(node._.trim());
    for (const key of Object.keys(node)) {
      if (key !== "$" && key !== "_") {
        texts.push(extractTextRecursive(node[key]));
      }
    }
    return texts.join(" ").trim();
  }
  return "";
};

export const parseXLF = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  const parser = new xml2js.Parser();
  const jsonData = await parser.parseStringPromise(data);

  // await writeLogToFile(jsonData, "ParsedJSONData");

  const transUnits = jsonData.xliff.file.flatMap(
    (file) => file.body[0]["trans-unit"]
  );
  // await writeLogToFile(transUnits, "TransUnits");

  const filteredUnits = transUnits.filter(
    (unit) => !unit.$.id.includes("caption") && !unit.$.id.includes("alt")
  );
  // await writeLogToFile(filteredUnits, "FilteredUnits");

  const extractedTexts = filteredUnits
    .map((unit) => {
      const sourceText = cleanText(extractTextRecursive(unit.source));
      const targetText = unit.target
        ? cleanText(extractTextRecursive(unit.target))
        : "";

      return {
        id: unit.$.id,
        source: sourceText,
        target: targetText,
      };
    })
    .filter((unit) => unit.source.length > 0);

  // await writeLogToFile(extractedTexts, "ExtractedTexts");

  return extractedTexts;
};

export const convertXLFToWord = async (filePath, outputDocx) => {
  const extractedTexts = await parseXLF(filePath);

  const filteredTexts = extractedTexts.filter(
    (entry) => entry.source && entry.source.trim().length > 0
  );

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

          return [
            new Paragraph({
              children: [sourceTextRun],
            }),
            new Paragraph({ text: "" }),
          ];
        }),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputDocx, buffer);
};

export const cleanJsonData = (jsonData) => {
  return jsonData.map((item) => ({
    source: item.source,
    target: item.target,
  }));
};

export const convertJsonToWord = async (jsonData, outputDocx) => {
  const cleanedData = cleanJsonData(jsonData);

  const doc = new Document({
    sections: [
      {
        children: cleanedData.map(
          (entry) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: `ID: ${entry.id}`,
                  bold: true,
                }),
                new TextRun({
                  text: `\nSource: ${entry.source}`,
                  break: 1,
                }),
                new TextRun({
                  text: `\nTarget: ${entry.target}`,
                  break: 1,
                }),
              ],
            })
        ),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(outputDocx, buffer);
};

export const parseWordFile = async (filePath) => {
  const { value: extractedText } = await mammoth.extractRawText({
    path: filePath,
  });
  return extractedText;
};

export const downloadFile = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(convertedDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      throw err;
    }
  });
};

export const cleanupFiles = async (files) => {
  for (const file of files) {
    try {
      // Only remove files from the uploads directory
      if (file.includes("uploads")) {
        await fs.unlink(file);
      }
    } catch (error) {
      console.error(`Error removing file ${file}:`, error);
    }
  }
};
