document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userName");
  const appliedCount = document.getElementById("appliedCount");
  const applicationsTable = document.getElementById("applicationsTable");

  const showMessage = (text, type = "success") => {
    const messageBox = document.createElement("div");
    messageBox.className = `message-box message-${type}`;
    messageBox.textContent = text;
    document.body.appendChild(messageBox);
    setTimeout(() => messageBox.remove(), 3000);
  };

  // Redirect if not logged in
  if (!token) {
    showMessage("Please login to access your dashboard!", "error");
    setTimeout(() => window.location.href = "login.html", 2000);
    return;
  }

  try {
    // Fetch user profile
    const resProfile = await fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await resProfile.json();

    if (resProfile.ok) {
      userInfo.style.display = "inline";
      userName.textContent = profileData.name;
    } else {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    // Fetch applied jobs
    const resJobs = await fetch("http://localhost:5000/api/jobs/applied", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appliedJobs = await resJobs.json();

    if (resJobs.ok) {
      appliedCount.textContent = appliedJobs.length;

      // Clear table first
      applicationsTable.innerHTML = "";

      if (appliedJobs.length === 0) {
        applicationsTable.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center;">No applications found</td>
          </tr>`;
      } else {
        appliedJobs.forEach((job) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${job.jobTitle}</td>
            <td>${job.company}</td>
            <td>
              <span class="${
                job.status === "Accepted" ? "status-accepted" :
                job.status === "Rejected" ? "status-rejected" :
                "status-pending"
              }">${job.status}</span>
            </td>
            <td>${new Date(job.dateApplied).toLocaleDateString()}</td>
          `;
          applicationsTable.appendChild(row);
        });
      }
    } else {
      showMessage("Failed to load applied jobs", "error");
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        showMessage("Logout successful!", "success");
        setTimeout(() => window.location.href = "login.html", 1500);
      });
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    showMessage("Something went wrong. Try again.", "error");
  }
});
