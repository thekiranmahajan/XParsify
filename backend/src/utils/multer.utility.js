import multer from "multer";
import path from "path";
import fs from "fs";
import { __dirname, uploadsDir, convertedDir } from "./dirname.js";

// Create directories if they don't exist
[uploadsDir, convertedDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Preserve extension
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".docx", ".xlf"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .docx and .xlf files are allowed!"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});
