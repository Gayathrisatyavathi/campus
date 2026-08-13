async function api(url, options = {}) {
  const response = await fetch(url, { credentials: "include", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function showMessage(message, type = "error") {
  const el = document.getElementById("form-message");
  if (!el) return;
  el.textContent = message;
  el.className = `form-message ${type}`;
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = loginForm.querySelector("button");
    button.disabled = true; button.innerHTML = "Signing In...";
    try {
      const form = new FormData(loginForm);
      const data = await api("/api/auth/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(Object.fromEntries(form)) });
      showMessage("Login successful. Opening dashboard...", "success");
      setTimeout(() => location.href = data.user?.role === "admin" ? "/admin.html" : "/dashboard.html", 400);
    } catch (error) {
      showMessage(error.message);
      button.disabled = false; button.innerHTML = "Sign In <span>→</span>";
    }
  });
  document.getElementById("forgot")?.addEventListener("click", e => {
    e.preventDefault(); showMessage("Password recovery can be connected to your college email provider when deployed.");
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = registerForm.querySelector("button");
    button.disabled = true; button.innerHTML = "Creating Account...";
    try {
      const form = new FormData(registerForm);
      const body = Object.fromEntries(form);
      await api("/api/auth/register", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
      showMessage("Account created successfully! Redirecting...", "success");
      setTimeout(() => location.href = "/dashboard.html", 500);
    } catch (error) {
      showMessage(error.message);
      button.disabled = false; button.innerHTML = "Create Account <span>→</span>";
    }
  });
}
