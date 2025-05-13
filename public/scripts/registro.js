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

const registrarse = async (nombre, email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        user: nombre,
        email: email.toLowerCase(),
        password: password,
        role: "user",
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showMessage("Registro exitoso", false);
      setTimeout(() => {
        // Change to API_URL for proper redirection
        window.location.href = `${API_URL}/login`;
      }, 1500);
    } else {
      showMessage(data.message || "Error al registrarse", true);
    }
  } catch (error) {
    console.error("Error:", error);
    showMessage("Error al conectar con el servidor", true);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  const loader = document.getElementById("loader");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Get form values
      const nombre = form.elements["nombre"].value.trim();
      const email = form.elements["email"].value.trim();
      const password = form.elements["password"].value;

      // Basic validation
      if (!nombre || !email || !password) {
        showMessage("Todos los campos son requeridos", true);
        return;
      }

      // Validate email format
      if (!email.includes("@")) {
        showMessage("Email inválido", true);
        return;
      }

      // Show loader
      if (loader) loader.style.display = "block";
      form.style.display = "none";

      try {
        await registrarse(nombre, email, password);
      } catch (error) {
        console.error("Error:", error);
        showMessage("Error al procesar el registro", true);
      } finally {
        // Hide loader
        if (loader) loader.style.display = "none";
        form.style.display = "block";
      }
    });
  }
});
