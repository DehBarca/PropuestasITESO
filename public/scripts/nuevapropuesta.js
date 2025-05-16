// --- Personalización y redirección según rol ---
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    const data = await res.json();
    if (!data.success || !data.user || !data.user.role) {
      window.location.href = "login.html";
      return;
    }
    const roleSpan = document.querySelector(".navbar .text-light");
    if (data.user.role === "admin") {
      if (roleSpan)
        roleSpan.innerHTML = '<i class="bi bi-shield-check"></i> Admin';
    } else if (data.user.role === "user") {
      if (roleSpan) roleSpan.innerHTML = '<i class="bi bi-person"></i> Usuario';
      // NO redirijas aquí, permite que el usuario use la página
    } else {
      window.location.href = "login.html";
    }
  } catch (error) {
    window.location.href = "login.html";
  }
});

// --- Lógica para crear propuesta (deja esto si ya lo tienes) ---
document
  .getElementById("form-nueva-propuesta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtén el id del usuario autenticado
    let userId = null;
    try {
      const resUser = await fetch("/api/user/me", { credentials: "include" });
      const dataUser = await resUser.json();
      if (dataUser.success && dataUser.user && dataUser.user.id) {
        userId = dataUser.user.id;
      } else {
        throw new Error("No autenticado");
      }
    } catch (error) {
      document.getElementById("mensaje").innerHTML =
        '<div class="alert alert-danger">No autenticado.</div>';
      return;
    }

    const title = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const category = document.getElementById("categoria").value;
    const img = document.getElementById("img").value.trim();

    const propuesta = {
      title,
      descripcion,
      category: [category],
      img: img || undefined, // No envíes string vacío
      autor: userId,
    };

    try {
      const res = await fetch(`/api/propuesta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(propuesta),
      });
      const data = await res.json();
      const mensaje = document.getElementById("mensaje");
      if (res.ok && data) {
        mensaje.innerHTML = `<div class="alert alert-success">¡Propuesta creada exitosamente!</div>`;
        setTimeout(() => {
          window.location.href = "HomeLoggedin.html";
        }, 1500);
      } else {
        mensaje.innerHTML = `<div class="alert alert-danger">Error: ${
          data.message || "No se pudo crear la propuesta."
        }</div>`;
      }
    } catch (error) {
      document.getElementById(
        "mensaje"
      ).innerHTML = `<div class="alert alert-danger">Error de red o servidor.</div>`;
    }
  });
