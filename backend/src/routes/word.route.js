import express from "express";
import multer from "multer";
import { parseWord } from "../controllers/word.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("files", 5), parseWord);

export default router;
