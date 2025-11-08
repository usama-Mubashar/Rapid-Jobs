// register.js
function showMessage(message, type = "success") {
  const box = document.getElementById("messageBox");
  box.textContent = message;
  box.className = "message-box"; // reset class
  box.classList.add(type === "success" ? "message-success" : "message-error");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg=document.querySelectorAll('.registermessage');
    const name = document.querySelector('input[placeholder="Enter your name"]').value;
    const email = document.querySelector('input[placeholder="Enter your email"]').value;
    const password = document.querySelector('input[placeholder="Create a password"]').value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm your password"]').value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (res.ok) {
  showMessage(" Registration successful!", "success");
  setTimeout(() => window.location.href = "login.html", 1500);
} else {
  showMessage(data.message || "Registration failed!", "error");
}

    } catch (error) {
      alert(" Server Error: " + error.message);
    }
  });
});
