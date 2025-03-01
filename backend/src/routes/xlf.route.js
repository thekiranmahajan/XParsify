import express from "express";
import multer from "multer";
import { processXLF } from "../controllers/xlf.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.array("files", 5), processXLF);

export default router;
