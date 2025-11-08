import express from "express";
import { getDashboardStats, getRecentJobs } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { postJob } from "../controllers/adminController.js";

const router = express.Router();

// GET → Dashboard stats
router.get("/stats", protect, adminOnly, getDashboardStats);

// GET → Recent jobs
router.get("/recent-jobs", protect, adminOnly, getRecentJobs);
router.post("/post-job", protect, adminOnly, postJob);

export default router;
