import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import unzipper from "unzipper";
import xml2js from "xml2js";
import { writeLogToFile } from "./constants.utility.js";
import { cleanupFiles } from "./file.utility.js";

const stripRtf = (rtf) => {
  return rtf
    .replace(/({\\fonttbl.*?})/gs, "")
    .replace(/({\\colortbl.*?})/gs, "")
    .replace(/({\\\*\\generator.*?})/gs, "")
    .replace(/({\\.*?})/gs, "")
    .replace(/\\[a-zA-Z]+\d* ?/g, "")
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) =>
      String.fromCharCode(parseInt(match.slice(2), 16))
    )
    .replace(/\\par[d]?/g, " ")
    .replace(/[{}]/g, "")
    .replace(/[\u0000]/g, "")
    .replace(/-147/g, "")
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const unzipDocx = async (filePath, outputDir) => {
  await fs.mkdir(outputDir, { recursive: true });
  await createReadStream(filePath)
    .pipe(unzipper.Extract({ path: outputDir }))
    .promise();
};

const extractLessons = async (dirPath) => {
  const xmlPath = path.join(dirPath, "word/document2.xml");
  const xmlData = await fs.readFile(xmlPath, "utf-8");
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  const paragraphs = result["w:document"]["w:body"]?.[0]["w:p"] || [];

  const lessons = paragraphs
    .map((p) =>
      p["w:r"]
        ?.map((r) => r["w:t"]?.[0])
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .filter((heading) => heading.startsWith("1."))
    .slice(1)
    .map((heading) => ({
      lesson: heading.replace(/\r?\n|\r/g, " ").trim(),
    }));

  return lessons;
};

const extractNotes = async (dirPath) => {
  const datFiles = (await fs.readdir(path.join(dirPath, "word")))
    .filter((f) => f.startsWith("afchunk") && f.endsWith(".dat"))
    .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));

  const notes = [];
  for (const file of datFiles) {
    const rawContent = await fs.readFile(
      path.join(dirPath, "word", file),
      "utf-8"
    );
    const cleanText = stripRtf(rawContent);
    notes.push(cleanText);
  }

  return notes;
};

const parseWord = async (uploadedFilePath) => {
  try {
    const tempExtractPath = uploadedFilePath + "_unzipped";
    await unzipDocx(uploadedFilePath, tempExtractPath);

    const lessons = await extractLessons(tempExtractPath);
    const notes = await extractNotes(tempExtractPath);

    const parsedData = lessons.map((lesson, idx) => ({
      lesson: lesson.lesson,
      notes: notes[idx] || "",
    }));

    await writeLogToFile(parsedData, "parsedWordMerged");

    await cleanupFiles([tempExtractPath]);

    return parsedData;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw error;
  }
};

export default parseWord;
