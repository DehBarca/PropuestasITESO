import { request, response } from "express";

import { validarToken, decodeToken } from "../utils/jwt.js";
import { User } from "../database/entities/users.js"; // importa el modelo User

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const url = req.originalUrl;

    if (!token) {
      if (url.includes("api")) {
        return res
          .status(401)
          .json({ status: 401, error: "Sin autorización." });
      } else {
        return res.redirect("/login.html");
      }
    }

    if (!validarToken(token)) {
      if (url.includes("api")) {
        return res.status(401).json({ status: 401, error: "Token inválido." });
      } else {
        res.clearCookie("jwt");
        return res.redirect("/login.html");
      }
    }

    const { payload } = decodeToken(token);
    req.headers.role = payload.role;

    // Asigna el usuario a req.user para rutas autenticadas
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("Error al validar las credenciales:", error);
    res.status(500).json({ status: 500, error: error.message });
  }
};
