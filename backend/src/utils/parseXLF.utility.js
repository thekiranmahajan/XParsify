import xml2js from "xml2js";
import fs from "fs/promises";
import { EXCLUDE_SENTENCES } from "./constants.utility.js";

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

const filterExcludedSentences = (texts) => {
  return texts
    .filter((unit) => !EXCLUDE_SENTENCES.includes(unit.source))
    .map((unit) => {
      if (
        unit.source.includes(
          "Select START MODULE to begin. Be sure to click on the interactive elements to advance."
        )
      ) {
        unit.source = unit.source.replace(
          "Select START MODULE to begin. Be sure to click on the interactive elements to advance.",
          "Select the arrow to continue."
        );
      }
      return unit;
    });
};

const parseXLF = async (filePath) => {
  const data = await fs.readFile(filePath, "utf-8");
  const parser = new xml2js.Parser();
  const jsonData = await parser.parseStringPromise(data);

  const transUnits = jsonData.xliff.file.flatMap(
    (file) => file.body[0]["trans-unit"]
  );

  const filteredUnits = transUnits.filter((unit) => !unit.$.id.includes("alt"));

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

  const filteredExtractedTexts = filterExcludedSentences(extractedTexts);

  return filteredExtractedTexts;
};

export default parseXLF;
