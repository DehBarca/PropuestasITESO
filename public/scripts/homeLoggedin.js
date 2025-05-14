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
