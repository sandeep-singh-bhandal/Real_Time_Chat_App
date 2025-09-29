import express from "express";
import http from "http";
import "dotenv/config";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;


// Connecting Mongo DB
connectDB()

// API to check server status
app.use("/api/status", (req, res) => res.send("Server is live!"));

// API endpoints
app.use("/api/user",userRoutes)


server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
