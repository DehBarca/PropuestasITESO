const API_URL = "http://localhost:8080";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
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
