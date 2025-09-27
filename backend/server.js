import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Database Connection
connectDB();

// Middleware Connections
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// API endpoints
app.use("/api/status", (req, res) => res.send("API is running..."));
app.use("/api/user/", userRouter);

// Connection
server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
