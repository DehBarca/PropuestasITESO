import express from "express";
import { UserService } from "../service/users.service.js";
import { checkAuth } from "../middlewares/is.authenticated.js";

const router = express.Router();
const service = new UserService();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await service.login({ email, password });

    if (result.success) {
      res.cookie("jwt", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });
      res.status(200).json({ success: true, data: { token: result.token } });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

router.post("/registro", async (req, res) => {
  try {
    const result = await service.registrar(req.body); // Use instance method

    if (result.success) {
      res.cookie("jwt", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.status(201).json({ success: true, message: "Registro exitoso" });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ message: "Error al cerrar sesión" });
  }
});

export const authRouter = router;
