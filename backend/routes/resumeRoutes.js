import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import Resume from "../models/resumeModel.js";

const router = express.Router();

// 📂 Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/resumes/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🟢 POST /api/resume/upload
router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resume = await Resume.create({
      name: req.body.name,
      email: req.body.email,
      resumeFile: req.file.filename, // ✅ only filename (not path)
      user: req.user._id,
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resumeFile: req.file.filename,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Failed to upload resume", error: error.message });
  }
});

export default router;
