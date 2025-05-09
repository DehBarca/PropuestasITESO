const limite = 3;

const service = new PeliculaService();

const cargarPeliculas = async (paginaActual = 1) => {
  try {
    const {registros, paginas, items} = await service.getAll(paginaActual, limite);

    let cardGroup = document.getElementById("cardGroup");
    
    cardGroup.querySelectorAll(".col-card").forEach((e) => e.remove());
    
    Array.from(items).forEach((p) => {
      const card = Pelicula.fromObject(p);
      cardGroup.appendChild(card.toHtml());
    });

    return paginas;
  } catch (error) {
    console.log(error);
  }
};

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

document.addEventListener("DOMContentLoaded", async (event) => {
  event.preventDefault();

  let btnSiguiente = document.getElementById("btnSiguiente");
  let btnAnterior = document.getElementById("btnAnterior");

  let paginaActual = getPageNumber() ? parseInt(getPageNumber()) : 1;
  let totalPaginas = 1;
  const pages = await cargarPeliculas();
  totalPaginas = pages;

  actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);

  btnSiguiente.addEventListener("click", (event) => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      actualizarURL(paginaActual);
      cargarPeliculas(paginaActual);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });

  btnAnterior.addEventListener("click", (event) => {
    if (paginaActual > 1) {
      paginaActual--;
      actualizarURL(paginaActual);
      cargarPeliculas(paginaActual);
      actualizarBotones(btnAnterior, btnSiguiente, paginaActual, totalPaginas);
    }
  });
});
