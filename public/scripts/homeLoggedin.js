document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      localStorage.clear();
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

async function getCurrentUser() {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    const data = await res.json();
    if (data.success && data.user) {
      return data.user; // Devuelve el usuario actual
    }
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
  }
  return null;
}

function addCardEventListeners(cardDiv, isAdmin) {
  // ...otros listeners...

  const saveBtn = cardDiv.querySelector(".save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async (e) => {
      const propuestaId = saveBtn.dataset.id;
      try {
        const response = await fetch(`/api/user/save/${propuestaId}`, {
          method: "POST",
          credentials: "include",
        });
        const result = await response.json();
        if (result.success) {
          // Cambia el icono y color según guardado
          if (result.action === "added") {
            saveBtn.classList.remove("btn-outline-warning");
            saveBtn.classList.add("btn-warning");
            saveBtn.querySelector("i").classList.remove("bi-bookmark");
            saveBtn.querySelector("i").classList.add("bi-bookmark-fill");
          } else {
            saveBtn.classList.remove("btn-warning");
            saveBtn.classList.add("btn-outline-warning");
            saveBtn.querySelector("i").classList.remove("bi-bookmark-fill");
            saveBtn.querySelector("i").classList.add("bi-bookmark");
          }
        }
      } catch (error) {
        console.error("Error al guardar propuesta:", error);
      }
    });
  }
}

function crearCard(propuesta, currentUser) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";

  const autorNombre =
    propuesta.autor && propuesta.autor.user
      ? propuesta.autor.user
      : "Autor desconocido";

  const isOwner =
    currentUser && propuesta.autor && propuesta.autor._id === currentUser.id;

  const ownerControls = isOwner
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
          ${ownerControls}
        </div>
      </div>
    </div>
  `;

  cardDiv.innerHTML = card;

  addCardEventListeners(cardDiv, isOwner);

  return cardDiv;
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = await getCurrentUser();
});
