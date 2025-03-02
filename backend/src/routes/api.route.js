import express from "express";
import {
  convertSingle,
  convertBatch,
} from "../controllers/convert.controller.js";
import { upload } from "../utils/multer.utility.js";

const router = express.Router();

router.post("/convert", upload.single("file"), convertSingle);
router.post("/convert-batch", upload.array("files", 5), convertBatch);

export default router;
