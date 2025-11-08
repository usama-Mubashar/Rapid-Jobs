import Job from "../models/Job.js";
import Resume from "../models/resumeModel.js"; // ✅ new import

// 🟣 Admin Only - Post Job
export const postJob = async (req, res) => {
  try {
    const { title, company, location, salary, description, requirements } = req.body;

    const job = new Job({
      title,
      company,
      location,
      salary,
      description,
      requirements,
      createdBy: req.user._id,
    });

    const createdJob = await job.save();
    res.status(201).json({ message: "Job posted successfully!", job: createdJob });
  } catch (error) {
    res.status(500).json({ message: "Failed to post job", error: error.message });
  }
};

// 🟢 Public - Get All Jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "name email")
      
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
};

// 🟢 Public - Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟠 Admin - Update Job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Ensure only the creator/admin can update
    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(job, req.body);
    const updatedJob = await job.save();
    res.json({ message: "Job updated successfully", updatedJob });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Admin - Delete Job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 Candidate - Apply for Job
export const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // ✅ Check if user uploaded resume
    const resume = await Resume.findOne({ user: userId });
    if (!resume) {
      return res
        .status(400)
        .json({ message: "Please upload your resume before applying" });
    }

    // ✅ Prevent duplicate application
    if (
      job.applications &&
      job.applications.some((app) => app.user.toString() === userId.toString())
    ) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // ✅ Add application inside Job
    job.applications = job.applications || [];
    job.applications.push({
      user: userId,
      name: resume.name,
      email: resume.email,
      resumeFile: resume.resumeFile,
      resumePath: `/uploads/resumes/${resume.resumeFile}`, // ✅ new fiel
    });

    await job.save();

    res.json({ message: "✅ Application submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍💼 Admin - Get All Candidates Who Applied
export const getAllCandidates = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email");
    const candidates = [];

    jobs.forEach((job) => {
      job.applications?.forEach((app) => {
        candidates.push({
          jobId: job._id,              // ✅ Needed for PATCH
          userId: app.user,            // ✅ Needed for PATCH
          jobTitle: job.title,
          name: app.name,
          email: app.email,
          resumeFile: app.resumeFile,
          resumePath: `/uploads/resumes/${app.resumeFile}`,
          status: app.status || "Pending",  // ✅ Current status
        });
      });
    });

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("🟢 Getting applied jobs for user:", userId);

    const appliedJobs = await Job.find({ "applications.user": userId })
      .select("title company createdAt applications");

    console.log("Found jobs:", appliedJobs.length);

    const result = appliedJobs.map((job) => {
      const userApp = job.applications.find(
        (app) => app.user.toString() === userId.toString()
      );

      console.log("Processing job:", job.title);
      console.log("User application:", userApp);

      return {
        jobTitle: job.title,
        company: job.company,
        dateApplied: userApp?.createdAt || job.createdAt,
        status: userApp?.status || "Pending",
      };
    });

    console.log("Result to send:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error in getAppliedJobs:", error);
    res.status(500).json({
      message: "Failed to fetch applied jobs",
      error: error.message,
    });
  }
};
// 🟣 Admin - Update candidate status (Accept/Reject)
export const updateCandidateStatus = async (req, res) => {
  const { jobId, userId } = req.params;
  const { status } = req.body; // should be "Accepted" or "Rejected"

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = job.applications.find(
      (app) => app.user.toString() === userId
    );

    if (!application)
      return res.status(404).json({ message: "Candidate application not found" });

    application.status = status; // Update status

    await job.save();
    res.json({ message: `Candidate status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

