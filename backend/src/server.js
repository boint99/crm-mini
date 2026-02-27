import express from "express";
import dotenv from "dotenv";

dotenv.config(); // load biến môi trường

const app = express();
const port = process.env.BACKEND_PORT || 8017;

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
