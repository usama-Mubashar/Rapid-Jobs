document.addEventListener("DOMContentLoaded", async () => {
  // ✅ DOM Elements
  const jobsContainer = document.getElementById("jobsContainer");
  const token = localStorage.getItem("token");

  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userName");
  const loginLink = document.getElementById("loginLink");
  const nav = document.querySelector("nav");

  const searchInput = document.getElementById("jobSearchInput");
  const locationSelect = document.getElementById("locationSelect");
  const searchButton = document.getElementById("searchButton");

  // ✅ Message box
  const messageBox = document.createElement("div");
  messageBox.classList.add("message-box");
  document.body.prepend(messageBox);

  const showMessage = (text, type = "success") => {
    messageBox.textContent = text;
    messageBox.className = `message-box message-${type}`;
    messageBox.style.display = "block";
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 2500);
  };

  // ✅ Load user profile if logged in
  if (token) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        userInfo.style.display = "inline";
        loginLink.style.display = "none";
        userName.textContent = data.name;

        if (!document.getElementById("dashboardLink")) {
          const dashboardLink = document.createElement("a");
          dashboardLink.href = "dashboard.html";
          dashboardLink.textContent = "Dashboard";
          dashboardLink.id = "dashboardLink";
          dashboardLink.style.fontWeight = "500";
          nav.insertBefore(dashboardLink, userInfo);
        }
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Error loading user info:", err);
      localStorage.removeItem("token");
    }
  }

  // ✅ Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      showMessage("You have logged out successfully!", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    });
  }

  // ✅ Render jobs
  const renderJobs = (jobs) => {
    if (!jobs.length) {
      jobsContainer.innerHTML = "<p>No jobs found.</p>";
      return;
    }

    jobsContainer.innerHTML = jobs
      .map(
        (job) => `
      <div class="job-card">
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location}</p>
        <p>${job.description}</p>
        <button class="apply-btn" data-id="${job._id}">Apply Now</button>
        <p class="msg-box" style="color:#0056d6; font-weight:500; margin-top:8px; display:none;"></p>
      </div>
    `
      )
      .join("");
  };

  // ✅ Fetch top 3 latest jobs
  try {
    const res = await fetch("http://localhost:5000/api/jobs");
    const jobs = await res.json();

    if (res.ok && jobs.length > 0) {
      const latestJobs = jobs.slice(-3).reverse(); // top 3 recent
      renderJobs(latestJobs);
    } else {
      jobsContainer.innerHTML = "<p>No jobs available.</p>";
    }
  } catch (err) {
    console.error("Error loading jobs:", err);
    jobsContainer.innerHTML = `<p style="color:red;">Error loading jobs.</p>`;
  }

  // ✅ Search functionality
  if (searchButton) {
    searchButton.addEventListener("click", async () => {
      const location = locationSelect.value.trim().toLowerCase();
      const keyword = searchInput.value.trim().toLowerCase();

      try {
        const res = await fetch("http://localhost:5000/api/jobs");
        const allJobs = await res.json();

        let filtered = allJobs;
        if (location) {
          filtered = filtered.filter(
            (job) => job.location.toLowerCase() === location
          );
        }
        if (keyword) {
          filtered = filtered.filter(
            (job) =>
              job.title.toLowerCase().includes(keyword) ||
              job.company.toLowerCase().includes(keyword)
          );
        }

        renderJobs(filtered);
      } catch (error) {
        console.error("Search error:", error);
      }
    });
  }

  // ✅ Apply button logic
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("apply-btn")) {
      const token = localStorage.getItem("token");
      const msgBox = e.target.parentElement.querySelector(".msg-box");

      const showMsg = (text, color = "red") => {
        msgBox.textContent = text;
        msgBox.style.color = color;
        msgBox.style.display = "block";
        setTimeout(() => (msgBox.style.display = "none"), 3000);
      };

      if (!token) {
        showMsg("Please login first!");
        setTimeout(() => (window.location.href = "login.html"), 2000);
        return;
      }

      const hasResume = localStorage.getItem("resumeUploaded");
      if (!hasResume) {
        showMsg("Please upload your resume first!");
        setTimeout(() => (window.location.href = "upload-resume.html"), 2000);
        return;
      }

      const jobId = e.target.dataset.id;

      try {
        const res = await fetch(
          `http://localhost:5000/api/jobs/apply/${jobId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) showMsg("✅ Application submitted successfully!", "green");
        else showMsg(`⚠️ ${data.message}`);
      } catch (error) {
        console.error("Error applying for job:", error);
        showMsg("Something went wrong. Please try again.");
      }
    }
  });
});
