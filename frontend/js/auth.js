const apiURL = "http://localhost:5000/api/auth";
function showMessage(message, type = "success") {
  const box = document.getElementById("messageBox");
  box.textContent = message;
  box.className = "message-box"; // reset class
  box.classList.add(type === "success" ? "message-success" : "message-error");
}

// Handle Registration
const registerForm = document.querySelector("form#registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch(`${apiURL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message || "Registration complete!");
    if (res.ok) window.location.href = "login.html";
  });
}

// Handle Login
const loginForm = document.querySelector("form#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch(`${apiURL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);

  if (data.role === "admin") {
    showMessage("Welcome Admin!", "success");
    setTimeout(() => window.location.href = "admin-dashboard.html", 1500);
  } else {
    showMessage("Login successful!", "success");
    setTimeout(() => window.location.href = "index.html", 1500);
  }
} else {
  showMessage(data.message || "Invalid credentials!", "error");
}


  });
}
