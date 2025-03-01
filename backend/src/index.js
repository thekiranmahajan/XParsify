import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is up and running!!😌");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is runing on port: ${PORT}`));
