import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js";

const API_URL = "http://localhost:8080";

async function cargarPerfil() {
  try {
    // 1. Obtener usuario autenticado
    const res = await fetch("/api/user/me", { credentials: "include" });
    const data = await res.json();
    if (data.success && data.user) {
      document.getElementById("userName").textContent =
        data.user.user || "Sin nombre";
      document.getElementById("userEmail").textContent = data.user.email || "";

      // 2. Obtener publicaciones del usuario
      const propuestasRes = await fetch(
        `${API_URL}/api/propuesta?autor=${data.user.id}`,
        {
          credentials: "include",
        }
      );
      const propuestasData = await propuestasRes.json();

      // Estadísticas
      const stats = [
        `<li class="list-group-item">Publicaciones: <b>${
          propuestasData.items?.length || 0
        }</b></li>`,
        `<li class="list-group-item">Votos recibidos: <b>${propuestasData.items?.reduce(
          (acc, p) => acc + (p.likes || 0),
          0
        )}</b></li>`,
        `<li class="list-group-item">Proyectos seguidos: <b>-</b></li>`, // Puedes personalizar esto
      ];
      document.getElementById("userStats").innerHTML = stats.join("");

      // Lista de publicaciones
      if (propuestasData.items && propuestasData.items.length > 0) {
        document.getElementById("userPropuestas").innerHTML =
          propuestasData.items
            .map(
              (p) =>
                `<li class="list-group-item d-flex flex-column align-items-start">
                <span class="fw-bold">${p.title}</span>
                <span class="text-muted small">${p.descripcion}</span>
                <span class="badge bg-primary mt-1">${(p.category || []).join(
                  ", "
                )}</span>
                <span class="small mt-1">Likes: ${p.likes || 0} | Dislikes: ${
                  p.dislikes || 0
                }</span>
              </li>`
            )
            .join("");
      } else {
        document.getElementById("userPropuestas").innerHTML =
          '<li class="list-group-item">No tienes publicaciones</li>';
      }

      // (Opcional) Lista de contribuciones (comentarios/interacciones)
      document.getElementById("userContribuciones").innerHTML =
        '<li class="list-group-item">Próximamente...</li>';
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarPerfil);
