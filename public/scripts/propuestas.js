async function cargarPropuestas() {
  try {
    const response = await fetch("/api/propuesta", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const propuestas = await response.json();
    const container = document.querySelector("#cards-container .row");
    container.innerHTML = ""; // Limpiar contenedor

    propuestas.forEach((propuesta) => {
      const card = crearCard(propuesta);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading propuestas:", error);
  }
}

function crearCard(propuesta) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "col-md-4 mb-4";
  cardDiv.innerHTML = `
        <div class="card">
            <img src="${propuesta.img || "https://via.placeholder.com/150"}" 
                 class="card-img-top" 
                 alt="${propuesta.title}">
            <div class="card-body">
                <h5 class="card-title">${propuesta.title}</h5>
                <div class="mb-2">
                    ${propuesta.category
                      .map(
                        (cat) =>
                          `<button class="btn btn-primary btn-sm card-category me-1" disabled>${cat}</button>`
                      )
                      .join("")}
                </div>
                <p class="card-text mt-2">${propuesta.descripcion}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-success" onclick="actualizarLikes('${
                      propuesta._id
                    }', true)">
                        <i class="bi bi-hand-thumbs-up"></i> 
                        <span class="likes-count">${propuesta.likes}</span>
                    </button>
                    <button class="btn btn-outline-danger" onclick="actualizarLikes('${
                      propuesta._id
                    }', false)">
                        <i class="bi bi-hand-thumbs-down"></i>
                        <span class="dislikes-count">${
                          propuesta.dislikes
                        }</span>
                    </button>
                    <button class="btn btn-outline-primary" onclick="mostrarComentarios('${
                      propuesta._id
                    }')">
                        <i class="bi bi-chat"></i> Comentar
                    </button>
                </div>
            </div>
        </div>
    `;
  return cardDiv;
}

async function actualizarLikes(id, isLike) {
  try {
    const response = await fetch(`/api/propuesta/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [isLike ? "likes" : "dislikes"]: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar likes");
    }

    // Actualizar UI
    const card = document.querySelector(`[data-propuesta-id="${id}"]`);
    const countElement = card.querySelector(
      `.${isLike ? "likes" : "dislikes"}-count`
    );
    countElement.textContent = parseInt(countElement.textContent) + 1;
  } catch (error) {
    console.error("Error:", error);
  }
}

// Cargar propuestas cuando el documento esté listo
document.addEventListener("DOMContentLoaded", cargarPropuestas);
