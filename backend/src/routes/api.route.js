import express from "express";
import { upload } from "../utils/multer.utility.js";
import convertSingleFile from "../controllers/convertSingleFile.controller.js";
import convertMultipleFiles from "../controllers/convertMultiplefiles.controller.js";

const router = express.Router();

router.post("/convert", upload.single("file"), convertSingleFile);

router.post("/convert-batch", upload.array("files", 5), convertMultipleFiles);

export default router;
