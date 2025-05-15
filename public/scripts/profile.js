import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js";

const API_URL = "http://localhost:8080";

async function cargarPerfil() {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    const data = await res.json();
    if (data.success && data.user) {
      document.getElementById("userName").textContent =
        data.user.user || "Sin nombre";
      document.getElementById("userEmail").textContent = data.user.email || "";
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarPerfil);
