import express from "express";
import multer from "multer";
import { parseWord } from "../controllers/word.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), parseWord);

export default router;
