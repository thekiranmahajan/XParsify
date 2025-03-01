import { parseWordFile } from "../utils/file.utility.js";

export const parseWord = async (req, res) => {
  try {
    const text = await parseWordFile(req.file.path);
    res.json({ message: "Word file processed!", text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
