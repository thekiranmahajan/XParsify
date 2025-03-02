import fs from "fs/promises";
import xml2js from "xml2js";
import mammoth from "mammoth";
import path from "path";
import { __dirname, convertedDir } from "./dirname.js";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const parseXLF = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  const parser = new xml2js.Parser();
  const jsonData = await parser.parseStringPromise(data);

  const extractedTexts = jsonData.xliff.file.flatMap((file) =>
    file.body[0]["trans-unit"].map((unit) => ({
      id: unit.$.id,
      source: extractText(unit.source[0]),
      target: unit.target ? extractText(unit.target[0]) : "",
    }))
  );

  return extractedTexts;
};

const extractText = (source) => {
  if (typeof source === "string") {
    return source;
  } else if (source.g) {
    return source.g.map((g) => g._).join(" ");
  }
  return "";
};

export const convertXLFToWord = async (filePath, outputDocx) => {
  const extractedTexts = await parseXLF(filePath);

  const doc = new Document({
    sections: [
      {
        children: extractedTexts.map(
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
