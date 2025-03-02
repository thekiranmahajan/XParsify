import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.route.js";
import { __dirname } from "./utils/dirname.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files with /api prefix
app.use("/api/files", express.static(path.join(__dirname, "converted")));

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api", apiRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
