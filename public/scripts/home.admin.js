const API_URL = "http://localhost:8080";

let currentUser = null;

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
          ${adminControls}
        </div>
      </div>
    </div>
  `;

  cardDiv.innerHTML = card;

  // Add event listeners
  cardDiv.querySelector(".edit-btn").addEventListener("click", handleEdit);
  cardDiv.querySelector(".delete-btn")?.addEventListener("click", handleDelete);

  return cardDiv;
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

async function cargarPropuestas() {
  try {
    const response = await fetch(`${API_URL}/api/propuesta?page=1&limit=1000`, {
      credentials: "include",
    });
    const data = await response.json();
    const container = document.querySelector("#cards-container .row");
    container.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center">No se encontraron propuestas</div>';
      return;
    }

    data.items.forEach((propuesta) => {
      container.appendChild(crearCard(propuesta));
    });
  } catch (error) {
    const container = document.querySelector("#cards-container .row");
    container.innerHTML =
      '<div class="col-12 text-center text-danger">Error al cargar las propuestas</div>';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await getCurrentUser();
  await cargarPropuestas();
});
