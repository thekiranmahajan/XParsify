import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.route.js";
import { __dirname, frontendDistDir } from "./utils/dirname.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files with /api prefix
app.use("/api/files", express.static(path.join(__dirname, "converted")));

const allowedOrigins = [
  "http://localhost:5173",
  "https://xparsify.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());
app.use("/api", apiRoutes);

/*********PRODUCTION CODE**********/
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDistDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistDir, "index.html"));
  });
}
/*********PRODUCTION CODE**********/

app.listen(PORT, () => console.log(`Server running on  ${PORT}`));
