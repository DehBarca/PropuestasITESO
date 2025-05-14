import jwtDecode from "https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.esm.js";

const API_URL = "http://localhost:8080";

async function cargarLikes() {
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
    const userId = decoded.id;

    const response = await fetch(`${API_URL}/api/propuesta?userId=${userId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al cargar las propuestas guardadas.");
    }

    const propuestas = await response.json();
    const container = document.querySelector(".row");
    container.innerHTML = "";

    if (propuestas.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center">No tienes propuestas guardadas o con "like".</div>';
      return;
    }

    propuestas.forEach((propuesta) => {
      const card = crearCard(propuesta);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

function crearCard(propuesta, onRemove) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";
  cardDiv.innerHTML = `
    <div class="card card-light h-100">
      <img src="${
        propuesta.img || "https://via.placeholder.com/150"
      }" class="card-img-top" alt="${propuesta.title || propuesta.titulo}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${
          propuesta.titulo || propuesta.title || "Sin título"
        }</h5>
        <div class="mb-2">
          ${(propuesta.category || [])
            .map(
              (cat) =>
                `<button class="btn btn-primary btn-sm card-category me-1 mb-1" disabled>${cat}</button>`
            )
            .join("")}
        </div>
        <p class="card-text">${
          propuesta.descripcion || propuesta.description || "Sin descripción"
        }</p>
        <div class="mt-auto">
          <button class="btn btn-warning save-btn" data-id="${
            propuesta._id
          }" title="Quitar de guardados">
            <i class="bi bi-bookmark-fill"></i> Quitar de guardados
          </button>
        </div>
      </div>
    </div>
  `;

  // Evento para quitar de guardados
  cardDiv.querySelector(".save-btn").addEventListener("click", async (e) => {
    const propuestaId = propuesta._id;
    try {
      const response = await fetch(`/api/user/save/${propuestaId}`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success && result.action === "removed") {
        cardDiv.remove();
        if (onRemove) onRemove();
      }
    } catch (error) {
      console.error("Error al quitar de guardados:", error);
    }
  });

  return cardDiv;
}

async function cargarGuardados() {
  try {
    const response = await fetch(`${API_URL}/api/user/saved`, {
      credentials: "include",
    });
    const data = await response.json();
    const container = document.querySelector("#cards-container .row");
    container.innerHTML = "";

    if (!data.success || !data.saved || data.saved.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center">No tienes propuestas guardadas.</div>';
      return;
    }

    data.saved.forEach((propuesta) => {
      container.appendChild(crearCard(propuesta));
    });
  } catch (error) {
    console.error("Error al cargar guardados:", error);
    const container = document.querySelector("#cards-container .row");
    container.innerHTML =
      '<div class="col-12 text-center text-danger">Error al cargar los guardados.</div>';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".row.mt-4");

  try {
    const res = await fetch("/api/user/saved", {
      credentials: "include",
    });
    const data = await res.json();

    if (
      !data.success ||
      !Array.isArray(data.saved) ||
      data.saved.length === 0
    ) {
      container.innerHTML = `<p class="text-center text-muted">No tienes propuestas guardadas.</p>`;
      return;
    }

    container.innerHTML = ""; // Limpiar el contenedor

    data.saved.forEach((propuesta) => {
      const card = crearCard(propuesta, () => {
        // Si ya no quedan cards, muestra mensaje
        if (container.children.length === 0) {
          container.innerHTML = `<p class="text-center text-muted">No tienes propuestas guardadas.</p>`;
        }
      });
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<p class="text-danger">Error al cargar propuestas guardadas.</p>`;
    console.error(error);
  }
});
