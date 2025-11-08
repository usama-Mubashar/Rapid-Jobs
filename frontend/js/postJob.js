document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // ✅ Restrict: only admins can access
  if (!token) {
    const accessMsg = document.getElementById("accessMessage");
    if (accessMsg) {
      accessMsg.textContent = "Access denied. Please login as admin.";
      accessMsg.style.color = "red";
      accessMsg.style.fontWeight = "600";
      accessMsg.style.display = "block";
      setTimeout(() => (window.location.href = "login.html"), 2000);
    } else {
      window.location.href = "login.html";
    }
    return;
  }

  const form = document.querySelector("form");
  const msgBox = document.getElementById("jobMessage"); // ✅ message area under form

  // Function to show smooth messages
  const showMsg = (text, color = "red") => {
    msgBox.textContent = text;
    msgBox.style.color = color;
    msgBox.style.fontWeight = "600";
    msgBox.style.display = "block";
    msgBox.style.opacity = "1";
    setTimeout(() => (msgBox.style.opacity = "0"), 3000);
  };

  // ✅ Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = form.querySelector('input[placeholder="e.g. Frontend Developer"]').value.trim();
    const company = form.querySelector('input[placeholder="e.g. BlueTech Solutions"]').value.trim();
    const location = form.querySelector('input[placeholder="e.g. Lahore, Karachi, Remote"]').value.trim();
    const jobType = form.querySelector("select").value;
    const description = form.querySelector("textarea").value.trim();

    const token = localStorage.getItem("token");

    if (!token) {
      showMsg("You must be logged in as admin to post a job!", "red");
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, company, location, jobType, description }),
      });

      const data = await res.json();

      if (res.ok) {
        showMsg("✅ Job posted successfully!", "green");
        form.reset();
      } else {
        showMsg("❌ Failed to post job: " + (data.message || "Unknown error"), "red");
      }
    } catch (err) {
      console.error(err);
      showMsg("❌ Something went wrong while posting the job.", "red");
    }
  });

  // ✅ Logout button functionality
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutMsg = document.getElementById("logoutMessage");

  if (logoutBtn && logoutMsg) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      logoutMsg.innerText = "Logout successful!";
      logoutMsg.style.color = "green";
      logoutMsg.style.fontWeight = "600";
      logoutMsg.style.display = "block";
      logoutMsg.style.opacity = "1";

      setTimeout(() => {
        logoutMsg.style.opacity = "0";
        window.location.href = "login.html";
      }, 1500);
    });
  } else {
    console.warn("Logout button or message box not found!");
  }
});
