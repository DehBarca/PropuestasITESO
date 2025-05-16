import express from "express";
import { checkAuth } from "../middlewares/is.authenticated.js";
import Comentario from "../database/entities/comentario.js";

const router = express.Router();

// Ruta para eliminar un comentario
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const comentarioId = req.params.id;

    const comentario = await Comentario.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const userId = req.user.id;
    const esAutorComentario = comentario.autor.toString() === userId;
    const esAdmin = req.user.role === "admin";

    if (!esAutorComentario && !esAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await comentario.deleteOne();
    res.status(200).json({ success: true, message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
});

export default router;
