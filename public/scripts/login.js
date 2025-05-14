const API_URL = "http://localhost:8080";

function showHideLoader(show, hide) {
  show.style.display = "block";
  hide.style.display = "none";
}

function showMessage(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `alert alert-${
    isError ? "danger" : "success"
  } position-fixed bottom-0 end-0 m-3`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showMessage("Inicio de sesión exitoso", false);
      setTimeout(() => {
        // Redirigir a HomeLoggedin.html
        window.location.href = "/HomeLoggedin.html";
      }, 1500);
    } else {
      showMessage(data.message || "Error al iniciar sesión", true);
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage(error.message || "Error al conectar con el servidor", true);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const loader = document.getElementById("loader");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value;

    // Basic validation
    if (!email || !password) {
      showMessage("Todos los campos son requeridos", true);
      return;
    }

    // Email validation
    if (!email.includes("@")) {
      showMessage("Email inválido", true);
      return;
    }

    if (loader) loader.style.display = "block";
    form.style.display = "none";

    try {
      await login(email, password);
    } catch (error) {
      console.error("Error:", error);
      showMessage("Error al procesar el inicio de sesión", true);
    } finally {
      if (loader) loader.style.display = "none";
      form.style.display = "block";
    }
  });
});
