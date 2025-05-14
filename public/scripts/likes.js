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

function crearCard(propuesta) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-6 mb-4";
  cardDiv.innerHTML = `
    <div class="card card-light shadow-sm">
      <div class="card-body">
        <h5 class="card-title d-flex justify-content-between">
          ${propuesta.title}
          <span class="badge bg-success">Proyecto</span>
        </h5>
        <p class="card-text">${propuesta.descripcion}</p>
        <div class="d-flex justify-content-between">
          <button class="btn btn-outline-success btn-sm">
            <i class="bi bi-hand-thumbs-up"></i> ${propuesta.likes}
          </button>
          <button class="btn btn-outline-danger btn-sm">
            <i class="bi bi-hand-thumbs-down"></i> ${propuesta.dislikes}
          </button>
          <button class="btn btn-outline-primary btn-sm">
            <i class="bi bi-chat"></i> Comentar
          </button>
        </div>
      </div>
    </div>
  `;
  return cardDiv;
}

document.addEventListener("DOMContentLoaded", cargarLikes);
