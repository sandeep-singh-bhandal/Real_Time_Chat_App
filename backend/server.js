import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

// Database Connection
connectDB();

// Middleware Connections
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connection
app.listen(port, () => {
  console.log("Server running on http://localhost:" + port);
});
