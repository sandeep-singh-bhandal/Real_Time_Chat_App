import express from "express";
import http from "http";
import "dotenv/config";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


// Connecting Mongo DB
connectDB()

// Middlewares Configuration
app.use(express.json())
app.use(cors())
app.use(cookieParser)

// API to check server status
app.use("/api/status", (req, res) => res.send("Server is live!"));

// API endpoints
app.use("/api/user",userRoutes)


server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
