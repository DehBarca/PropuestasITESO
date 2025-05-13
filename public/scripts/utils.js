export function getPageNumber() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("page");
}

export function actualizarURL(page) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("page", page);
  window.history.pushState({}, "", newUrl);
}
