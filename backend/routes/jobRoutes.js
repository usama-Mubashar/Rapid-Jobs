import express from "express";
import { updateCandidateStatus } from "../controllers/jobController.js";

import {
  postJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyJob,
  getAllCandidates,
  getAppliedJobs
} from "../controllers/jobController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧑‍💼 Admin - View all candidates
router.get("/candidates", protect, adminOnly, getAllCandidates);

// 🟢 Public - View all jobs
router.get("/", getJobs);

// 🟣 Admin - Post job
router.post("/", protect, adminOnly, postJob);

// 🟠 Admin - Update job
router.put("/:id", protect, adminOnly, updateJob);

// 🔴 Admin - Delete job
router.delete("/:id", protect, adminOnly, deleteJob);

// 🟡 Candidate - Apply for job
router.post("/apply/:id", protect, applyJob);

// 🟢 Candidate - View applied jobs
router.get("/applied", protect, getAppliedJobs);

// 🟢 Public - View single job
router.get("/:id", getJobById);



// jobRoutes.js
router.patch(
  "/:jobId/candidate/:userId/status", // remove extra /jobs
  protect,
  adminOnly,
  updateCandidateStatus
);


export default router;
