const params = new URLSearchParams(window.location.search);
const propuestaId = params.get("id");

const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const categoria = document.getElementById("categoria");
const img = document.getElementById("img");
const mensaje = document.getElementById("mensaje");

async function cargarPropuesta() {
  const res = await fetch(`/api/propuesta/${propuestaId}`);
  const propuesta = await res.json();
  titulo.value = propuesta.title;
  descripcion.value = propuesta.descripcion;
  categoria.value = propuesta.category.join(", ");
  img.value = propuesta.img || "";
}

document.getElementById("form-editar-propuesta").addEventListener("submit", async (e) => {
  e.preventDefault();
  const updated = {
    title: titulo.value,
    descripcion: descripcion.value,
    category: categoria.value.split(",").map((s) => s.trim()),
    img: img.value,
  };
  const res = await fetch(`/api/propuesta/${propuestaId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updated),
  });
  if (res.ok) {
    mensaje.innerHTML = '<div class="alert alert-success">Propuesta actualizada exitosamente.</div>';
    setTimeout(() => {
      window.location.href = "HomeLoggedin.html";
    }, 1200);
  } else {
    mensaje.innerHTML = '<div class="alert alert-danger">Error al actualizar la propuesta.</div>';
  }
});

window.addEventListener("DOMContentLoaded", cargarPropuesta);