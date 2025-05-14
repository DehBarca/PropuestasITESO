import express from "express";
import { UserService } from "../service/users.service.js";
import { checkAuth } from "../middlewares/is.authenticated.js";
import { User } from "../database/entities/users.js";
import mongoose from "mongoose";
import { decodeToken } from "../utils/jwt.js";
import { dbConnect, dbDisconnect } from "../database/connections.js";

const router = express.Router();
const service = new UserService();

// Guardar/Quitar propuesta de favoritos
router.post("/save/:propuestaId", checkAuth, async (req, res) => {
  await dbConnect();
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token); // <-- Cambia aquí
    const userId = payload.id;
    const propuestaId = req.params.propuestaId;

    if (!mongoose.Types.ObjectId.isValid(propuestaId)) {
      return res.status(400).json({ message: "ID de propuesta inválido" });
    }

    // Usa el modelo directamente para mantener la conexión activa
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
  } finally {
    await dbDisconnect();
  }
});

// Obtener propuestas guardadas del usuario autenticado
router.get("/saved", checkAuth, async (req, res) => {
  await dbConnect();
  try {
    const token = req.cookies.jwt;
    const { payload } = decodeToken(token);
    const userId = payload.id;

    const user = await User.findById(userId).populate("saved");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ success: true, saved: user.saved });
  } catch (error) {
    console.error("Error en /saved:", error); // <--- Agrega esto
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await dbDisconnect();
  }
});

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await service.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET authenticated user
router.get("/me", checkAuth, async (req, res) => {
  // checkAuth debe poner el usuario en req.user
  res.json({ success: true, user: req.user });
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await service.getUserByID(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user by email
router.get("/email/:email", async (req, res) => {
  try {
    const user = await service.getUserByEmail(req.params.email);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new user
router.post("/", async (req, res) => {
  try {
    const result = await service.registrar(req.body);
    if (result.success) {
      res.cookie("jwt", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });
      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Error al registrar usuario",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  try {
    const updated = await service.updateUser(req.params.id, req.body);
    if (updated) {
      res.status(200).json({ message: "User updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const result = await service.deleteUser(req.params.id);
    if (result) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
