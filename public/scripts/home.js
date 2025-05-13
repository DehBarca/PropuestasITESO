import { getPageNumber, actualizarURL } from "./utils.js";

const limite = 6;
const API_URL = "http://localhost:8080";

function actualizarBotones(
  btnAnterior,
  btnSiguiente,
  paginaActual,
  totalPaginas
) {
  if (paginaActual <= 1) {
    btnAnterior.parentElement.classList.add("disabled");
  } else {
    btnAnterior.parentElement.classList.remove("disabled");
  }
  if (paginaActual >= totalPaginas) {
    btnSiguiente.parentElement.classList.add("disabled");
  } else {
    btnSiguiente.parentElement.classList.remove("disabled");
  }
}

function crearCard(propuesta) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";
  cardDiv.innerHTML = `
    <div class="card h-100">
      <img src="${propuesta.img || "https://via.placeholder.com/150"}" 
           class="card-img-top" 
           alt="${propuesta.title}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${propuesta.title}</h5>
        <div class="mb-2">
          ${propuesta.category
            .map(
              (cat) =>
                `<button class="btn btn-primary btn-sm card-category me-1 mb-1" disabled>${cat}</button>`
            )
            .join("")}
        </div>
        <p class="card-text">${propuesta.descripcion}</p>
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center">
            <button class="btn btn-outline-success" onclick="darLike('${
              propuesta._id
            }')">
              <i class="bi bi-hand-thumbs-up"></i> 
              <span class="likes-count">${propuesta.likes || 0}</span>
            </button>
            <button class="btn btn-outline-danger" onclick="darDislike('${
              propuesta._id
            }')">
              <i class="bi bi-hand-thumbs-down"></i>
              <span class="dislikes-count">${propuesta.dislikes || 0}</span>
            </button>
            <button class="btn btn-outline-primary" onclick="mostrarComentarios('${
              propuesta._id
            }')">
              <i class="bi bi-chat"></i> Comentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  return cardDiv;
}

async function darLike(id) {
  try {
    const response = await fetch(`${API_URL}/api/propuesta/${id}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });
    if (response.ok) {
      const likesElement = document.querySelector(
        `[onclick="darLike('${id}')"] .likes-count`
      );
      likesElement.textContent = parseInt(likesElement.textContent) + 1;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function darDislike(id) {
  try {
    const response = await fetch(`${API_URL}/api/propuesta/${id}/dislike`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
      credentials: "include",
    });
    if (response.ok) {
      const dislikesElement = document.querySelector(
        `[onclick="darDislike('${id}')"] .dislikes-count`
      );
      dislikesElement.textContent = parseInt(dislikesElement.textContent) + 1;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const btnSiguiente = document.getElementById("btnSiguiente");
  const btnAnterior = document.getElementById("btnAnterior");

  let paginaActual = getPageNumber() ? parseInt(getPageNumber()) : 1;
  let totalPaginas = 1;

  const cargarPropuestas = async (paginaActual = 1) => {
    try {
      const response = await fetch(
        `${API_URL}/api/propuesta?page=${paginaActual}&limit=6`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          mode: "cors",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const container = document.querySelector("#cards-container .row");
      container.innerHTML = "";

      data.items.forEach((propuesta) => {
        container.appendChild(crearCard(propuesta));
      });

      return data.totalPages;
    } catch (error) {
      console.error("Error:", error);
      const container = document.querySelector("#cards-container .row");
      container.innerHTML =
        '<div class="col-12 text-center text-danger">Error al cargar las propuestas</div>';
    }
  };

  totalPaginas = await cargarPropuestas(paginaActual);
  actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);

  btnSiguiente?.addEventListener("click", async () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      actualizarURL(paginaActual);
      await cargarPropuestas(paginaActual);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });

  btnAnterior?.addEventListener("click", async () => {
    if (paginaActual > 1) {
      paginaActual--;
      actualizarURL(paginaActual);
      await cargarPropuestas(paginaActual);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });
});
