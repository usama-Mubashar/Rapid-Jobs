document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Access denied! Please login as admin.");
    window.location.href = "login.html";
    return;
  }

  try {
    // ✅ Fetch dashboard stats
    const statsRes = await fetch("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await statsRes.json();

    if (statsRes.ok) {
      document.querySelector(".card:nth-child(1) p").textContent = stats.totalUsers;
      document.querySelector(".card:nth-child(2) p").textContent = stats.totalJobs;
      document.querySelector(".card:nth-child(3) p").textContent = stats.totalResumes;
    }

    // ✅ Fetch recent jobs
    const jobsRes = await fetch("http://localhost:5000/api/admin/recent-jobs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jobs = await jobsRes.json();

    if (jobsRes.ok) {
      const table = document.querySelector("table");
      table.innerHTML = `
        <tr>
          <th>Job Title</th>
          <th>Company</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      `;

      jobs.forEach(job => {
  const jobId = job._id || job.id; // ✅ handle both cases
  console.log("Loaded job:", jobId, job.title);

  const row = `
    <tr data-id="${job._id || job.id}">
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${new Date(job.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="delete-btn" data-id="${job._id || job.id}">🗑 Delete</button>

      </td>
    </tr>
  `;
  table.innerHTML += row;
});


    }
  } catch (err) {
    console.error("Error loading admin data:", err);
  }

  // ✅ Delete job handler
  document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const jobId = e.target.dataset.id; // ✅ now always defined


      if (!confirm("Are you sure you want to delete this job?")) return;

      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Job deleted successfully!");
          e.target.closest("tr").remove(); // remove row from UI
        } else {
          alert(`❌ Failed to delete job: ${data.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Error deleting job:", err);
        alert("❌ Error deleting job. Check console.");
      }
    }
  });
});

// ✅ Logout logic (same as before)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      const msgBox = document.getElementById("logoutMessage");
      msgBox.innerText = " Logout successful!";
      msgBox.classList.add("show");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    });
  } else {
    console.warn("Logout button not found in DOM!");
  }
});
document.querySelectorAll(".delete-btn").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const jobId = row.dataset.id; // now it should work!
console.log("Deleting Job:", jobId); // ✅ should now print a valid ObjectI
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        row.remove();
        alert(data.message || "Job deleted successfully");
      } else {
        alert(data.message || "Failed to delete job");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
});
