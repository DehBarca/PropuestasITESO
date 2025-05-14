import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js";

const API_URL = "http://localhost:8080";

async function cargarPerfil() {
  try {
    const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});
    const token = cookies.jwt;

    if (!token) {
      console.error("No se encontró el token JWT.");
      return;
    }

    const decoded = jwtDecode(token);
    const userName = decoded.user;
    const userEmail = decoded.email;

    document.getElementById("userName").textContent = userName;
    document.getElementById("userEmail").textContent = userEmail;

    const response = await fetch(`${API_URL}/api/user/stats`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const stats = await response.json();
      document.getElementById("userStats").textContent = `
        Publicaciones: ${stats.publicaciones}, Likes: ${stats.likes}, Comentarios: ${stats.comentarios}
      `;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarPerfil);
