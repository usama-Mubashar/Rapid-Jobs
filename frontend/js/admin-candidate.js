document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("candidatesBody");
  const noData = document.getElementById("noData");
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/jobs/candidates", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch candidates");

    if (data.length === 0) {
      noData.style.display = "block";
      return;
    }

    data.forEach((candidate) => {
      const row = document.createElement("tr");
      row.dataset.jobId = candidate.jobId;
      row.dataset.userId = candidate.userId;

      row.innerHTML = `
        <td>${candidate.jobTitle}</td>
        <td>${candidate.name}</td>
        <td>${candidate.email}</td>
        <td><a class="download-link" href="http://localhost:5000${candidate.resumePath}" target="_blank">Download</a></td>
        <td class="status-cell">
          <span class="status-badge status-${candidate.status.toLowerCase()}">${candidate.status}</span>
        </td>
        <td>
          <button class="action-btn accept-btn">Accept</button>
          <button class="action-btn reject-btn">Reject</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Button functionality
    tableBody.querySelectorAll(".accept-btn, .reject-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const jobId = row.dataset.jobId;
        const userId = row.dataset.userId;
        const newStatus = e.target.classList.contains("accept-btn") ? "Accepted" : "Rejected";

        try {
          const resUpdate = await fetch(
            `http://localhost:5000/api/jobs/${jobId}/candidate/${userId}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );

          if (!resUpdate.ok) throw new Error("Failed to update status");

          const statusCell = row.querySelector(".status-cell span");
          statusCell.textContent = newStatus;
          statusCell.className = `status-badge status-${newStatus.toLowerCase()}`;
        } catch (err) {
          console.error(err);
          alert("Failed to update candidate status.");
        }
      });
    });
  } catch (err) {
    console.error("Error:", err);
    noData.style.display = "block";
    noData.innerText = "⚠️ Failed to load candidates.";
  }
});

// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      const msgBox = document.getElementById("logoutMessage");
      msgBox.innerText = "Logout successful!";
      msgBox.classList.add("show");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    });
  }
});
