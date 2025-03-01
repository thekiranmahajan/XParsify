import express from "express";
import cors from "cors";
import xlfRoutes from "./routes/xlf.route.js";
import docxRoutes from "./routes/docx.route.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/xlf", xlfRoutes);
app.use("/api/docx", docxRoutes);

app.get("/", (req, res) => {
  res.send("Server is up and running!!😌");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is runing on port: ${PORT}`));
