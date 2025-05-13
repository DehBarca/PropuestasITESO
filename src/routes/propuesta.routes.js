import express from "express";
import PropuestaService from "../service/propuestas.service.js";

const router = express.Router();
const service = new PropuestaService();

router.get("/", async (req, res) => {
  try {
    const propuestas = await service.getPropuestas();
    res.status(200).json(propuestas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

router.put("/:id/like", async (req, res) => {
  try {
    const result = await service.updateLikes(req.params.id, true);
    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ message: "Propuesta not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/dislike", async (req, res) => {
  try {
    const result = await service.updateLikes(req.params.id, false);
    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ message: "Propuesta not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
