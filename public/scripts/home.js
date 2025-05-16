import { getPageNumber, actualizarURL } from "./utils.js";

const limite = 6;

let currentUser = null;

// Obtén el usuario actual al cargar la página
async function getCurrentUser() {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
    }
  } catch (error) {
    currentUser = null;
  }
}

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

  const autorNombre =
    propuesta.autor && propuesta.autor.user
      ? propuesta.autor.user
      : "Autor desconocido";

  const isAdmin = currentUser && currentUser.role === "admin";
  const isOwner =
    currentUser && propuesta.autor && propuesta.autor._id === currentUser.id;

  const adminControls =
    isAdmin || isOwner
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
      <a href="comentarios.html?id=${propuesta._id}">
        <img src="${propuesta.img || "https://via.placeholder.com/150"}" 
             class="card-img-top" 
             alt="${propuesta.title}">
      </a>
      <div class="card-body d-flex flex-column">
        <a href="comentarios.html?id=${
          propuesta._id
        }" class="text-decoration-none text-dark">
          <h5 class="card-title">${propuesta.title}</h5>
        </a>
        <div class="mb-2">
          ${propuesta.category
            .map(
              (cat) =>
                `<button class="btn btn-primary btn-sm card-category me-1 mb-1" disabled>${cat}</button>`
            )
            .join("")}
        </div>
        <p class="card-text">${propuesta.descripcion}</p>
        <p class="card-text text-muted mb-1"><small>Autor: ${autorNombre}</small></p>
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
  addCardEventListeners(cardDiv, isAdmin || isOwner);

  return cardDiv;
}

function addCardEventListeners(cardDiv, canEdit) {
  const likeBtn = cardDiv.querySelector(".like-btn");
  const dislikeBtn = cardDiv.querySelector(".dislike-btn");
  const saveBtn = cardDiv.querySelector(".save-btn");
  const commentBtn = cardDiv.querySelector(".comment-btn");

  // LIKE
  likeBtn.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const response = await fetch(`/api/propuesta/${button.dataset.id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const likesCount = button.querySelector(".likes-count");
        const dislikesCount = dislikeBtn.querySelector(".dislikes-count");
        likesCount.textContent = result.data.likes;
        dislikesCount.textContent = result.data.dislikes;

        // Estado visual
        if (result.data.userLike) {
          button.classList.add("active", "btn-success");
          button.classList.remove("btn-outline-success");
        } else {
          button.classList.remove("active", "btn-success");
          button.classList.add("btn-outline-success");
        }

        if (result.data.userDislike) {
          dislikeBtn.classList.add("active", "btn-danger");
          dislikeBtn.classList.remove("btn-outline-danger");
        } else {
          dislikeBtn.classList.remove("active", "btn-danger");
          dislikeBtn.classList.add("btn-outline-danger");
        }
      } else {
        showMessage(result.message || "Error al procesar la acción", true);
      }
    } catch (error) {
      showMessage("Error al procesar la acción", true);
    } finally {
      button.disabled = false;
    }
  });

  // DISLIKE
  dislikeBtn.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const response = await fetch(
        `/api/propuesta/${button.dataset.id}/dislike`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const likesCount = likeBtn.querySelector(".likes-count");
        const dislikesCount = button.querySelector(".dislikes-count");
        likesCount.textContent = result.data.likes;
        dislikesCount.textContent = result.data.dislikes;

        // Estado visual
        if (result.data.userDislike) {
          button.classList.add("active", "btn-danger");
          button.classList.remove("btn-outline-danger");
        } else {
          button.classList.remove("active", "btn-danger");
          button.classList.add("btn-outline-danger");
        }

        if (result.data.userLike) {
          likeBtn.classList.add("active", "btn-success");
          likeBtn.classList.remove("btn-outline-success");
        } else {
          likeBtn.classList.remove("active", "btn-success");
          likeBtn.classList.add("btn-outline-success");
        }
      } else {
        showMessage(result.message || "Error al procesar la acción", true);
      }
    } catch (error) {
      showMessage("Error al procesar la acción", true);
    } finally {
      button.disabled = false;
    }
  });

  // GUARDADO
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
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
        showMessage("Error al guardar propuesta", true);
      }
    });
  }

  // COMENTARIOS
  if (commentBtn) {
    commentBtn.addEventListener("click", (e) => {
      const propuestaId = commentBtn.dataset.id;
      window.location.href = `comentarios.html?id=${propuestaId}`;
    });
  }

  // Admin controls
  if (canEdit) {
    cardDiv.querySelector(".edit-btn")?.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `editarpropuesta.html?id=${id}`;
    });
    cardDiv
      .querySelector(".delete-btn")
      ?.addEventListener("click", handleDelete);
  }
}

async function handleEdit(e) {
  const id = e.currentTarget.dataset.id;
  const card = e.currentTarget.closest(".col-md-4");
  const title = card.querySelector(".card-title").textContent;
  const descripcion = card.querySelector(".card-text").textContent;
  const img = card.querySelector(".card-img-top").src;
  const category = Array.from(card.querySelectorAll(".card-category")).map(
    (btn) => btn.textContent
  );

  // Modal simple usando prompt (puedes reemplazar por un modal de Bootstrap)
  const newTitle = prompt("Editar título:", title);
  if (newTitle === null) return;
  const newDescripcion = prompt("Editar descripción:", descripcion);
  if (newDescripcion === null) return;
  const newCategory = prompt(
    "Editar categorías (separadas por coma):",
    category.join(", ")
  );
  if (newCategory === null) return;
  const newImg = prompt("Editar URL de imagen:", img);
  if (newImg === null) return;

  const updated = {
    title: newTitle,
    descripcion: newDescripcion,
    category: newCategory.split(",").map((s) => s.trim()),
    img: newImg,
  };

  try {
    const response = await fetch(`/api/propuesta/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updated),
    });
    if (response.ok) {
      // Actualiza la card en el DOM
      card.querySelector(".card-title").textContent = updated.title;
      card.querySelector(".card-text").textContent = updated.descripcion;
      card.querySelector(".card-img-top").src = updated.img;
      const catDiv = card.querySelector(".mb-2");
      catDiv.innerHTML = updated.category
        .map(
          (cat) =>
            `<button class="btn btn-primary btn-sm card-category me-1 mb-1" disabled>${cat}</button>`
        )
        .join("");
      showMessage("Propuesta actualizada exitosamente");
    } else {
      showMessage("Error al actualizar la propuesta", true);
    }
  } catch (error) {
    showMessage("Error al actualizar la propuesta", true);
  }
}

async function handleDelete(e) {
  const btn = e.currentTarget;
  const id = btn?.dataset.id;
  if (!id) return;

  if (confirm("¿Estás seguro de que quieres eliminar esta propuesta?")) {
    try {
      const response = await fetch(`/api/propuesta/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Solo elimina si btn y su card existen
        const card = btn.closest(".col-md-4");
        if (card) card.remove();
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

  await getCurrentUser();

  const isAdmin = window.location.pathname.includes("admin");
  let paginaActual = getPageNumber() ? parseInt(getPageNumber()) : 1;
  let totalPaginas = 1;
  let searchTimeout;

  const cargarPropuestas = async (paginaActual = 1, searchTerm = "") => {
    try {
      const response = await fetch(
        `/api/propuesta?page=${paginaActual}&limit=6&search=${encodeURIComponent(
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
        container.appendChild(crearCard(propuesta));
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
