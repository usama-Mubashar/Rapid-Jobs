document.getElementById("resumeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first!");

  const formData = new FormData();
  formData.append("name", e.target.name.value);
  formData.append("email", e.target.email.value);
  formData.append("resume", e.target.resume.files[0]);

  const res = await fetch("http://localhost:5000/api/resume/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ Resume uploaded successfully!");
    localStorage.setItem("resumeUploaded", "true");
  } else {
    alert("❌ " + data.message);
  }
});
