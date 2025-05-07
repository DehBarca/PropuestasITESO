import express from "express";
import PropuestaService from "../service/propuestas.service.js";

const router = express.Router();
const service = new PropuestaService();

// GET all propuestas
router.get("/propuesta", async (req, res) => {
  try {
    const propuestas = await service.getPropuestas();
    res.status(200).json(propuestas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET propuesta by ID
router.get("/propuesta/:id", async (req, res) => {
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

// POST new propuesta
router.post("/propuesta", async (req, res) => {
  try {
    const newPropuesta = await service.addPropuesta(req.body);
    res.status(201).json(newPropuesta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update propuesta
router.put("/propuesta/:id", async (req, res) => {
  try {
    const updated = await service.updatePropuesta(req.params.id, req.body);
    if (updated) {
      res.status(200).json({ message: "Propuesta updated successfully" });
    } else {
      res.status(404).json({ message: "Propuesta not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE propuesta
router.delete("/propuesta/:id", async (req, res) => {
  try {
    const result = await service.deletePropuesta(req.params.id);
    if (result) {
      res.status(200).json({ message: "Propuesta deleted successfully" });
    } else {
      res.status(404).json({ message: "Propuesta not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
