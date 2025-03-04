import mammoth from "mammoth";
import { writeLogToFile } from "./constants.utility.js";

const parseWord = async (filePath) => {
  try {
    const { value: extractedText } = await mammoth.extractRawText({
      path: filePath,
    });

    const lines = extractedText.split("\n").map((line) => line.trim());
    const lessons = [];
    let currentLesson = null;

    lines.forEach((line) => {
      if (line.startsWith("Lesson:")) {
        if (currentLesson) {
          lessons.push(currentLesson);
        }
        currentLesson = { lesson: line, notes: "" };
      } else if (currentLesson) {
        currentLesson.notes += `${line}\n`;
      }
    });

    if (currentLesson) {
      lessons.push(currentLesson);
    }

    const result = lessons.map((lesson) => ({
      lesson: lesson.lesson,
      notes: lesson.notes.trim(),
    }));

    await writeLogToFile(result, "parseWord");
    return result;
  } catch (error) {
    console.error("Error parsing Word file:", error);
    throw error;
  }
};

export default parseWord;
