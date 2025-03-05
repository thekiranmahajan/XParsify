import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.route.js";
import { __dirname, frontendDistDir, convertedDir } from "./utils/dirname.js";
import path from "path";
import { downloadFile } from "./utils/file.utility.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/files", express.static(convertedDir));

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use("/api", apiRoutes);

app.get("/api/files/:filename", downloadFile);

/*********PRODUCTION CODE**********/
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistDir, "index.html"));
  });
}
/*********PRODUCTION CODE**********/

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
