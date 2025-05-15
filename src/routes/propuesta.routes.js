import express from "express";
import PropuestaService from "../service/propuestas.service.js";
import { checkAuth } from "../middlewares/is.authenticated.js";
import { decodeToken } from "../utils/jwt.js";

const router = express.Router();
const service = new PropuestaService();

router.get("/", async (req, res) => {
  const { page, limit, search, userId, autor } = req.query;
  // pásalo al servicio
  const result = await service.getPropuestas(
    page,
    limit,
    search,
    userId,
    autor
  );
  res.json(result);
});

router.get("/:id", async (req, res) => {
  try {
    const propuesta = await service.getPropuestaByID(req.params.id);
    if (propuesta) {
      res.status(200).json(propuesta);
    } else {
      res.status(404).json({ message: "Propuesta not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newPropuesta = await service.addPropuesta(req.body);
    res.status(201).json(newPropuesta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id/like", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const result = await service.updateLikes(req.params.id, token, true);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/dislike", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const result = await service.updateLikes(req.params.id, token, false);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EDITAR PROPUESTA
router.put("/:id", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token);
    const userId = payload.id;
    const userRole = payload.role;

    const propuesta = await service.getPropuestaByID(req.params.id);
    if (!propuesta) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }

    // Solo admin o autor puede editar
    if (userRole !== "admin" && propuesta.autor.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const updated = await service.updatePropuesta(req.params.id, req.body);
    if (updated) {
      res.status(200).json({ message: "Propuesta actualizada" });
    } else {
      res.status(400).json({ message: "No se pudo actualizar la propuesta" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ELIMINAR PROPUESTA
router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token);
    const userId = payload.id;
    const userRole = payload.role;

    const propuesta = await service.getPropuestaByID(req.params.id);
    if (!propuesta) {
      return res.status(404).json({ message: "Propuesta no encontrada" });
    }

    // Solo admin o autor puede eliminar
    if (userRole !== "admin" && propuesta.autor.toString() !== userId) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const deleted = await service.deletePropuesta(req.params.id);
    if (deleted) {
      res.status(200).json({ message: "Propuesta eliminada" });
    } else {
      res.status(400).json({ message: "No se pudo eliminar la propuesta" });
    }
  } catch (error) {
    console.error("Error al eliminar propuesta:", error);
    res.status(500).json({ message: error.message });
  }
});

// Guardar/Quitar propuesta de favoritos
router.post("/save/:propuestaId", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token);
    const userId = payload.id;
    const propuestaId = req.params.propuestaId;

    if (!mongoose.Types.ObjectId.isValid(propuestaId)) {
      return res.status(400).json({ message: "ID de propuesta inválido" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (!Array.isArray(user.saved)) {
      user.saved = [];
    }

    const index = user.saved.findIndex((id) => id.toString() === propuestaId);
    let action;
    if (index >= 0) {
      user.saved.splice(index, 1);
      action = "removed";
    } else {
      user.saved.push(propuestaId);
      action = "added";
    }
    await user.save();
    res.json({ success: true, action, saved: user.saved });
  } catch (error) {
    console.error("Error en /save/:propuestaId:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtener propuestas guardadas del usuario autenticado
router.get("/saved", checkAuth, async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token);
    const userId = payload.id;

    const user = await User.findById(userId).populate("saved");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ success: true, saved: user.saved });
  } catch (error) {
    console.error("Error en /saved:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
