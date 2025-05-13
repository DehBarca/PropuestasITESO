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

function showMessage(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `alert alert-${
    isError ? "danger" : "success"
  } position-fixed bottom-0 end-0 m-3`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function crearCard(propuesta) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";

  const card = `
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
            <button class="btn btn-outline-success like-btn" data-id="${
              propuesta._id
            }">
              <i class="bi bi-hand-thumbs-up"></i> 
              <span class="likes-count">${propuesta.likes || 0}</span>
            </button>
            <button class="btn btn-outline-danger dislike-btn" data-id="${
              propuesta._id
            }">
              <i class="bi bi-hand-thumbs-down"></i>
              <span class="dislikes-count">${propuesta.dislikes || 0}</span>
            </button>
            <button class="btn btn-outline-primary comment-btn" data-id="${
              propuesta._id
            }">
              <i class="bi bi-chat"></i> Comentar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  cardDiv.innerHTML = card;

  // Add event listeners
  cardDiv.querySelector(".like-btn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;

    try {
      const response = await fetch(
        `${API_URL}/api/propuesta/${button.dataset.id}/like`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const likesCount = button.querySelector(".likes-count");
        likesCount.textContent = parseInt(likesCount.textContent) + 1;

        button.classList.remove("btn-outline-success");
        button.classList.add("btn-success");
        setTimeout(() => {
          button.classList.remove("btn-success");
          button.classList.add("btn-outline-success");
        }, 500);
      } else {
        showMessage(result.message || "Error al procesar la acción", true);
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("Error al procesar la acción", true);
    } finally {
      button.disabled = false;
    }
  });

  cardDiv.querySelector(".dislike-btn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const id = button.dataset.id;

    // Disable button temporarily to prevent multiple clicks
    button.disabled = true;

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
        const dislikesCount = button.querySelector(".dislikes-count");
        const currentDislikes = parseInt(dislikesCount.textContent);
        dislikesCount.textContent = currentDislikes + 1;

        // Visual feedback
        button.classList.remove("btn-outline-danger");
        button.classList.add("btn-danger");
        setTimeout(() => {
          button.classList.remove("btn-danger");
          button.classList.add("btn-outline-danger");
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      button.disabled = false;
    }
  });

  return cardDiv;
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
