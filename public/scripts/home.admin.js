const API_URL = "http://localhost:8080";

let currentUser = null;
let paginaActual = 1;
let totalPaginas = 1;
let searchTimeout = null;

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

  const adminControls = `
    <div class="mt-2 d-flex justify-content-between">
      <button class="btn btn-warning btn-sm edit-btn" data-id="${propuesta._id}">
        <i class="bi bi-pencil"></i> Editar
      </button>
      <button class="btn btn-danger btn-sm delete-btn" data-id="${propuesta._id}">
        <i class="bi bi-trash"></i> Eliminar
      </button>
    </div>
  `;

  const likeActive = propuesta.userLike
    ? "active btn-success"
    : "btn-outline-success";
  const dislikeActive = propuesta.userDislike
    ? "active btn-danger"
    : "btn-outline-danger";

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
        <p class="card-text text-muted mb-1"><small>Autor: ${autorNombre}</small></p>
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center">
            <button class="btn ${likeActive} like-btn" data-id="${
    propuesta._id
  }">
              <i class="bi bi-hand-thumbs-up"></i> 
              <span class="likes-count">${propuesta.likes || 0}</span>
            </button>
            <button class="btn ${dislikeActive} dislike-btn" data-id="${
    propuesta._id
  }">
              <i class="bi bi-hand-thumbs-down"></i>
              <span class="dislikes-count">${propuesta.dislikes || 0}</span>
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
  addCardEventListeners(cardDiv);
  return cardDiv;
}

function addCardEventListeners(cardDiv, isAdmin) {
  const likeBtn = cardDiv.querySelector(".like-btn");
  const dislikeBtn = cardDiv.querySelector(".dislike-btn");

  likeBtn.addEventListener("click", async (e) => {
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

      if (response.ok && result.success && result.data) {
        // Actualiza los contadores con los valores del backend
        const likesCount = button.querySelector(".likes-count");
        const dislikesCount = dislikeBtn.querySelector(".dislikes-count");
        likesCount.textContent = result.data.likes;
        dislikesCount.textContent = result.data.dislikes;

        // Estado visual: solo uno activo
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

  dislikeBtn.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const response = await fetch(
        `${API_URL}/api/propuesta/${button.dataset.id}/dislike`,
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

  const saveBtn = cardDiv.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      // ...
    });
  }

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
      showMessage("Error al guardar propuesta", true);
    }
  });

  cardDiv.querySelector(".edit-btn")?.addEventListener("click", handleEdit);
  cardDiv.querySelector(".delete-btn")?.addEventListener("click", handleDelete);
}

async function handleEdit(e) {
  const id = e.currentTarget.dataset.id;
  // Busca la propuesta actual en el DOM
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
  if (!btn) {
    showMessage("Error interno: botón no encontrado", true);
    return;
  }
  btn.disabled = true; // Evita dobles clics

  const id = btn.dataset.id;
  if (confirm("¿Estás seguro de que quieres eliminar esta propuesta?")) {
    try {
      const response = await fetch(`${API_URL}/api/propuesta/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        // Si no hay JSON, ignora el error
      }

      if (response.ok) {
        const card = btn.closest(".col-md-4");
        if (card) card.remove();
        showMessage("Propuesta eliminada exitosamente");
      } else {
        showMessage(data.message || "Error al eliminar la propuesta", true);
        btn.disabled = false; // Rehabilita si hubo error
      }
    } catch (error) {
      showMessage("Error al eliminar la propuesta", true);
      btn.disabled = false;
    }
  } else {
    btn.disabled = false;
  }
}

async function cargarPropuestas(pagina = 1, searchTerm = "") {
  try {
    let url = `${API_URL}/api/propuesta?page=${pagina}&limit=6&search=${encodeURIComponent(
      searchTerm
    )}`;
    if (currentUser && currentUser.id) {
      url += `&userId=${currentUser.id}`;
    }
    const response = await fetch(url, {
      credentials: "include",
    });
    const data = await response.json();
    const container = document.querySelector("#cards-container .row");
    container.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center">No se encontraron propuestas</div>';
      return 0;
    }

    data.items.forEach((propuesta) => {
      container.appendChild(crearCard(propuesta));
    });

    return data.totalPages;
  } catch (error) {
    const container = document.querySelector("#cards-container .row");
    if (container) {
      container.innerHTML =
        '<div class="col-12 text-center text-danger">Error al cargar las propuestas</div>';
    }
    console.error("Error al cargar propuestas:", error);
    return 0;
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

document.addEventListener("DOMContentLoaded", async () => {
  await getCurrentUser();

  const btnSiguiente = document.getElementById("btnSiguiente");
  const btnAnterior = document.getElementById("btnAnterior");
  const searchInput = document.querySelector(".input");

  paginaActual = 1;
  totalPaginas = await cargarPropuestas(paginaActual);

  actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);

  // Search handler con debounce
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      paginaActual = 1;
      totalPaginas = await cargarPropuestas(1, e.target.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }, 300);
  });

  btnSiguiente?.addEventListener("click", async () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      await cargarPropuestas(paginaActual, searchInput.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });

  btnAnterior?.addEventListener("click", async () => {
    if (paginaActual > 1) {
      paginaActual--;
      await cargarPropuestas(paginaActual, searchInput.value);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });
});

const updateLikes = async (id, token, isLike = true) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload.id) {
      throw new Error("Usuario no autorizado");
    }

    const userId = decoded.payload.id;
    const updateField = isLike ? "likes" : "dislikes";
    const oppositeField = isLike ? "dislikes" : "likes";

    // Buscar interacción existente
    const existingInteraction = await Interaction.findOne({
      userId,
      propuestaId: id,
    });

    let userLike = false;
    let userDislike = false;

    if (existingInteraction) {
      if (
        (isLike && existingInteraction.type === "like") ||
        (!isLike && existingInteraction.type === "dislike")
      ) {
        // Si ya existe la misma interacción, quitarla (toggle)
        await Propuesta.findByIdAndUpdate(id, {
          $inc: { [updateField]: -1 },
        });
        await existingInteraction.deleteOne();
      } else {
        // Cambiar de like a dislike o viceversa
        await Propuesta.findByIdAndUpdate(id, {
          $inc: { [updateField]: 1, [oppositeField]: -1 },
        });
        existingInteraction.type = isLike ? "like" : "dislike";
        await existingInteraction.save();
      }
    } else {
      // Crear nueva interacción
      await Interaction.create({
        userId,
        propuestaId: id,
        type: isLike ? "like" : "dislike",
      });
      await Propuesta.findByIdAndUpdate(id, {
        $inc: { [updateField]: 1 },
      });
    }

    // Obtener el estado actualizado
    const propuesta = await Propuesta.findById(id).lean();
    const userInteraction = await Interaction.findOne({
      userId,
      propuestaId: id,
    });

    if (userInteraction) {
      userLike = userInteraction.type === "like";
      userDislike = userInteraction.type === "dislike";
    }

    return {
      success: true,
      data: {
        likes: propuesta.likes,
        dislikes: propuesta.dislikes,
        userLike,
        userDislike,
      },
    };
  } catch (error) {
    console.error(
      `Error al actualizar ${isLike ? "likes" : "dislikes"}: `,
      error
    );
    return { success: false, message: error.message };
  }
};

const container = document.querySelector("#cards-container .row");
