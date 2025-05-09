function getPageNumber() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (!urlParams.has("page")) {
    return null;
  }
  const page = urlParams.get("page");
  console.log("Pagina actual: ", page);
  return page;
}

function actualizarURL(nuevaPagina) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("page", nuevaPagina);
  window.history.pushState(
    { page: nuevaPagina },
    `Página ${nuevaPagina}`,
    newUrl
  );
}


