const params = new URLSearchParams(window.location.search);
const propuestaId = params.get("id");

const propuestaDiv = document.getElementById("propuesta-info");
const chatDiv = document.getElementById("chat-comentarios");
const form = document.getElementById("form-comentario");
const input = document.getElementById("input-comentario");

async function cargarPropuesta() {
  const res = await fetch(`/api/propuesta/${propuestaId}`);
  const propuesta = await res.json();
  propuestaDiv.innerHTML = `
    <div class="card mb-3">
      <div class="row g-0">
        <div class="col-md-4">
          <img src="${propuesta.img}" class="img-fluid rounded-start" alt="${propuesta.title}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${propuesta.title}</h5>
            <p class="card-text">${propuesta.descripcion}</p>
            <p class="card-text"><small class="text-muted">Categoría: ${propuesta.category.join(", ")}</small></p>
            <p class="card-text"><small class="text-muted">Autor: ${propuesta.autor?.user || "Desconocido"}</small></p>
            <div class="d-flex gap-3 align-items-center mt-2">
              <span class="text-success"><i class="bi bi-hand-thumbs-up"></i> ${propuesta.likes?.length || propuesta.likes || 0} Likes</span>
              <span class="text-danger"><i class="bi bi-hand-thumbs-down"></i> ${propuesta.dislikes?.length || propuesta.dislikes || 0} Dislikes</span>
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
      <div class="mb-2">
        <b>${c.autor?.user || "Anónimo"}</b>
        <span class="text-muted small">${new Date(c.createdAt).toLocaleString()}</span>
        <div>${c.texto}</div>
      </div>
    `
    )
    .join("");
  chatDiv.scrollTop = chatDiv.scrollHeight;
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
  await cargarPropuesta();
  await cargarComentarios();
});