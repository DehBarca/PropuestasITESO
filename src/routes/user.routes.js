import express from "express";
import { UserService } from "../service/users.service.js"; // Change to named import

const router = express.Router();
const service = new UserService();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await service.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
