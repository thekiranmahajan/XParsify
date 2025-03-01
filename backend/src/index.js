import express from "express";
import cors from "cors";
import xlfRoutes from "./routes/xlf.route.js";
import wordRoutes from "./routes/word.route.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/xlf", xlfRoutes);
app.use("/api/word", wordRoutes);
app.get("/", (req, res) => {
  res.send("Server is up and running!!😌");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
