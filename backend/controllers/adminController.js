import User from "../models/userModel.js";
import Job from "../models/Job.js";
import Resume from "../models/resumeModel.js"; // agar resume model bana hua hai

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalResumes = await Resume.countDocuments();

    res.json({ totalUsers, totalJobs, totalResumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Recent Jobs
export const getRecentJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const postJob = async (req, res) => {
  try {
    const { title, company, location, salary, description, requirements } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const newJob = await Job.create({
      title,
      company,
      location,
      salary,
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements
        ? [requirements]
        : [],
      createdBy: req.user._id, // ✅ from logged-in admin (protect middleware)
    });

    res.status(201).json({
      message: "Job posted successfully!",
      job: newJob,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// 🧑‍💼 Admin - Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email");
    const candidates = [];

    jobs.forEach((job) => {
      job.applications?.forEach((app) => {
        candidates.push({
          jobTitle: job.title,
          name: app.name,
          email: app.email,
          resumeFile: app.resumeFile,
          resumePath: `/uploads/resumes/${app.resumeFile}`,
          jobId: job._id,       // ✅ Add jobId
          userId: app.user,     // ✅ Add userId
          status: app.status || "Pending", // ✅ optional: initial status
        });
      });
    });

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};
// 🟣 Admin - Update Candidate Status
export const updateCandidateStatus = async (req, res) => {
  try {
    const { jobId, userId } = req.params;
    const { status } = req.body; // "Accepted" or "Rejected"

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const candidate = job.applications.find(
      (app) => app.user.toString() === userId
    );

    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.status = status;
    await job.save();

    res.json({ message: "Candidate status updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update candidate status", error: error.message });
  }
};
