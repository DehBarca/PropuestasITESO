document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
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
  }
});
