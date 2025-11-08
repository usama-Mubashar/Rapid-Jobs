document.addEventListener("DOMContentLoaded", async () => {
  // -------------------
  // DOM Elements
  // -------------------
  const jobsContainer = document.getElementById("jobsContainer");
  const token = localStorage.getItem("token");

  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userName");
  const loginLink = document.getElementById("loginLink");
  const nav = document.querySelector("nav");
  const logoutBtn = document.getElementById("logoutBtn");

  // -------------------
  // Message box
  // -------------------
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

  // -------------------
  // User auth / dashboard link
  // -------------------
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

        // Add dashboard link if not present
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

  // -------------------
  // Logout
  // -------------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      showMessage("You have logged out successfully!", "success");
      setTimeout(() => (window.location.href = "login.html"), 1500);
    });
  }

  // -------------------
  // Render jobs
  // -------------------
  const renderJob = (job) => `
    <div class="job-card">
      <h3>${job.title}</h3>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Location:</strong> ${job.location}</p>
      <p>${job.description}</p>
      <button class="apply-btn" data-id="${job._id}">Apply Now</button>
      <p class="msg-box" style="color:#0056d6; font-weight:500; margin-top:8px; display:none;"></p>
    </div>
  `;

  try {
    const res = await fetch("http://localhost:5000/api/jobs");
    const data = await res.json();

    if (res.ok && data.length > 0) {
      jobsContainer.innerHTML = data.map(renderJob).join("");
    } else {
      jobsContainer.innerHTML = `<p>No jobs available.</p>`;
    }
  } catch (err) {
    console.error("Error loading jobs:", err);
    jobsContainer.innerHTML = `<p style="color:red;">Error loading jobs.</p>`;
  }

  // -------------------
  // Apply button
  // -------------------
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
