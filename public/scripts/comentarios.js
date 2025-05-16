const params = new URLSearchParams(window.location.search);
const propuestaId = params.get("id");

const propuestaDiv = document.getElementById("propuesta-info");
const chatDiv = document.getElementById("chat-comentarios");
const form = document.getElementById("form-comentario");
const input = document.getElementById("input-comentario");

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

async function cargarPropuesta() {
  const res = await fetch(`/api/propuesta/${propuestaId}`);
  const propuesta = await res.json();
  propuestaDiv.innerHTML = `
    <div class="card mb-3">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${propuesta.img}" class="img-fluid rounded-start" alt="${
    propuesta.title
  }">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${propuesta.title}</h5>
            <p class="card-text">${propuesta.descripcion}</p>
            <p class="card-text"><small class="text-muted">Categoría: ${propuesta.category.join(
              ", "
            )}</small></p>
            <p class="card-text"><small class="text-muted">Autor: ${
              propuesta.autor?.user || "Desconocido"
            }</small></p>
            <div class="d-flex gap-3 align-items-center mt-2">
              <span class="text-success"><i class="bi bi-hand-thumbs-up"></i> ${
                propuesta.likes?.length || propuesta.likes || 0
              } Likes</span>
              <span class="text-danger"><i class="bi bi-hand-thumbs-down"></i> ${
                propuesta.dislikes?.length || propuesta.dislikes || 0
              } Dislikes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function cargarComentarios() {
  const res = await fetch(`/api/propuesta/${propuestaId}/comentarios`);
  const data = await res.json();
  if (!data.success) {
    chatDiv.innerHTML = `<div class="text-danger">Error al cargar comentarios</div>`;
    return;
  }
  chatDiv.innerHTML = data.comentarios
    .map(
      (c) => `
      <div class="mb-2" data-comentario-id="${c._id}">
        <b>${c.autor?.user || "Anónimo"}</b>
        <span class="text-muted small">${new Date(
          c.createdAt
        ).toLocaleString()}</span>
        <div>${c.texto}</div>
        ${
          currentUser &&
          (currentUser.id === c.autor._id || currentUser.role === "admin")
            ? `<button class="btn btn-sm btn-danger btn-eliminar-comentario mt-1" data-id="${c._id}">
                <i class="bi bi-trash"></i> Eliminar
              </button>`
            : ""
        }
      </div>
    `
    )
    .join("");

  // Agregar eventos para eliminar comentarios
  document.querySelectorAll(".btn-eliminar-comentario").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const comentarioId = btn.dataset.id;
      console.log("ID del comentario a eliminar:", comentarioId);
      if (confirm("¿Eliminar este comentario?")) {
        try {
          const res = await fetch(`/api/comentario/${comentarioId}`, {
            method: "DELETE",
            credentials: "include",
          });
          const result = await res.json();
          if (result.success) {
            showMessage("Comentario eliminado exitosamente");
            await cargarComentarios();
          } else {
            showMessage(result.message || "Error al eliminar comentario", true);
          }
        } catch (error) {
          showMessage("Error al eliminar comentario", true);
        }
      }
    });
  });
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto) return;
  const res = await fetch(`/api/propuesta/${propuestaId}/comentarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ texto }),
  });
  input.value = "";
  await cargarComentarios();
});

window.addEventListener("DOMContentLoaded", async () => {
  await getCurrentUser();
  await cargarPropuesta();
  await cargarComentarios();
});
