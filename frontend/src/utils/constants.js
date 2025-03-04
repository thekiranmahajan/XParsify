export const FORMATS = ["TEXT", "CSV", "JSON", "EXCEL", "WORD"];
export const MAX_FILES = 5;
export const ALLOWED_EXTENSIONS = [".xlf", ".docx"];

export const BACKEND_BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "";
