import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js";

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
        `/api/propuesta?autor=${data.user.id}`,
        {
          credentials: "include",
        }
      );
      const propuestasData = await propuestasRes.json();

      // 3. Obtener número de comentarios en las propuestas del usuario
      const comentariosRes = await fetch(
        `/api/propuesta/estadisticas/${data.user.id}/comentarios`,
        {
          credentials: "include",
        }
      );
      const comentariosData = await comentariosRes.json();
      const comentariosEnPropuestas = comentariosData.totalComentarios || 0;

      // 4. Obtener propuestas guardadas
      const savedRes = await fetch("/api/user/saved", {
        credentials: "include",
      });
      const savedData = await savedRes.json();
      const proyectosSeguidos =
        savedData.success && Array.isArray(savedData.saved)
          ? savedData.saved.length
          : 0;

      // Estadísticas
      const stats = [
        `<li class="list-group-item">Publicaciones: <b>${
          propuestasData.items?.length || 0
        }</b></li>`,
        `<li class="list-group-item">Votos recibidos: <b>${propuestasData.items?.reduce(
          (acc, p) => acc + (p.likes || 0),
          0
        )}</b></li>`,
        `<li class="list-group-item">Comentarios en tus propuestas: <b>${comentariosEnPropuestas}</b></li>`,
        `<li class="list-group-item">Proyectos seguidos: <b>${proyectosSeguidos}</b></li>`,
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

      // (Opcional) Lista de contribuciones
      document.getElementById("userContribuciones").innerHTML =
        '<li class="list-group-item">Próximamente...</li>';
    }
  } catch (error) {
    console.error("Error al cargar perfil:", error);
  }
}

document.addEventListener("DOMContentLoaded", cargarPerfil);
