// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();
const __dirname = path.resolve();
app.use(cors());
app.use(express.json());
app.use("/api/resume", resumeRoutes);
app.get("/", (req, res) => {
  res.send("Job Portal API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
