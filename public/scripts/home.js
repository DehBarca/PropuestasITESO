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

function crearCard(propuesta, isAdmin = false) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";

  const adminControls = isAdmin
    ? `
    <div class="mt-2 d-flex justify-content-between">
      <button class="btn btn-warning btn-sm edit-btn" data-id="${propuesta._id}">
        <i class="bi bi-pencil"></i> Editar
      </button>
      <button class="btn btn-danger btn-sm delete-btn" data-id="${propuesta._id}">
        <i class="bi bi-trash"></i> Eliminar
      </button>
    </div>
  `
    : "";

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
            <button class="btn btn-outline-warning save-btn" data-id="${
              propuesta._id
            }" title="Guardar">
              <i class="bi bi-bookmark"></i>
            </button>
          </div>
          ${adminControls}
        </div>
      </div>
    </div>
  `;

  cardDiv.innerHTML = card;

  // Add event listeners
  addCardEventListeners(cardDiv, isAdmin);

  return cardDiv;
}

function addCardEventListeners(cardDiv, isAdmin) {
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

  cardDiv.querySelector(".save-btn").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const propuestaId = button.dataset.id;
    try {
      const response = await fetch(`/api/user/save/${propuestaId}`, {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();
      if (result.success) {
        if (result.action === "added") {
          button.classList.remove("btn-outline-warning");
          button.classList.add("btn-warning");
          button.querySelector("i").classList.remove("bi-bookmark");
          button.querySelector("i").classList.add("bi-bookmark-fill");
        } else {
          button.classList.remove("btn-warning");
          button.classList.add("btn-outline-warning");
          button.querySelector("i").classList.remove("bi-bookmark-fill");
          button.querySelector("i").classList.add("bi-bookmark");
        }
      }
    } catch (error) {
      console.error("Error al guardar propuesta:", error);
    }
  });

  if (isAdmin) {
    cardDiv.querySelector(".edit-btn")?.addEventListener("click", handleEdit);
    cardDiv
      .querySelector(".delete-btn")
      ?.addEventListener("click", handleDelete);
  }
}

async function handleEdit(e) {
  const id = e.currentTarget.dataset.id;
  // Implement edit functionality
}

async function handleDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (confirm("¿Estás seguro de que quieres eliminar esta propuesta?")) {
    try {
      const response = await fetch(`${API_URL}/api/propuesta/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        e.currentTarget.closest(".col-md-4").remove();
        showMessage("Propuesta eliminada exitosamente");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("Error al eliminar la propuesta", true);
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const btnSiguiente = document.getElementById("btnSiguiente");
  const btnAnterior = document.getElementById("btnAnterior");
  const searchInput = document.querySelector(".input");

  const isAdmin = window.location.pathname.includes("admin");
  let paginaActual = getPageNumber() ? parseInt(getPageNumber()) : 1;
  let totalPaginas = 1;
  let searchTimeout;

  const cargarPropuestas = async (paginaActual = 1, searchTerm = "") => {
    try {
      const response = await fetch(
        `${API_URL}/api/propuesta?page=${paginaActual}&limit=6&search=${encodeURIComponent(
          searchTerm
        )}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const container = document.querySelector("#cards-container .row");
      container.innerHTML = "";

      if (data.items.length === 0) {
        container.innerHTML =
          '<div class="col-12 text-center">No se encontraron propuestas</div>';
        return 0;
      }

      data.items.forEach((propuesta) => {
        container.appendChild(crearCard(propuesta, isAdmin));
      });

      return data.totalPages;
    } catch (error) {
      console.error("Error:", error);
      const container = document.querySelector("#cards-container .row");
      container.innerHTML =
        '<div class="col-12 text-center text-danger">Error al cargar las propuestas</div>';
      return 0;
    }
  };

  // Add search input handler with debounce
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      paginaActual = 1;
      actualizarURL(1);
      totalPaginas = await cargarPropuestas(1, e.target.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }, 300);
  });

  // Initial load
  totalPaginas = await cargarPropuestas(paginaActual);
  actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);

  // Pagination handlers
  btnSiguiente?.addEventListener("click", async () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      actualizarURL(paginaActual);
      await cargarPropuestas(paginaActual, searchInput.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });

  btnAnterior?.addEventListener("click", async () => {
    if (paginaActual > 1) {
      paginaActual--;
      actualizarURL(paginaActual);
      await cargarPropuestas(paginaActual, searchInput.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });
});
