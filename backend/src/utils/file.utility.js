import fs from "fs";
import xml2js from "xml2js";
import mammoth from "mammoth";

export const parseXLF = async (filePath) => {
  const data = fs.readFileSync(filePath, "utf-8");
  const parser = new xml2js.Parser();
  const jsonData = await parser.parseStringPromise(data);

  return jsonData.xliff.file[0].body[0]["trans-unit"].map((unit) => ({
    id: unit.$.id,
    source: unit.source[0],
    target: unit.target ? unit.target[0] : "NA",
  }));
};

export const parseWordFile = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};
