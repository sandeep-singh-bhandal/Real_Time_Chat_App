import express from "express";
import http from "http";
import "dotenv/config";
import connectDB from "./utils/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import { connectCloudinary } from "./utils/cloudinary.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Connecting Mongo DB
connectDB();

// Connecting To Cloudinary
await connectCloudinary();

// Middlewares Configuration
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// API to check server status
app.use("/api/status", (req, res) => res.send("Server is live!"));

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
