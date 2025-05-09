import { request, response } from "express";

import { validarToken, decodeToken } from "../utils/jwt.js";

export const checkAuth = async (req = request, res = response, next) => {
  try {
    const token = req.cookies.jwt;

    const url = req.originalUrl;

    if (!validarToken(token) && url.includes("api")) {
      console.log("Sin autorización a la api.");
      res.status(401).send({ status: 401, error: "Sin autorización." });
      return;
    }
    if (!validarToken(token) && !url.includes("api")) {
      console.log("Aquí.");
      console.log("Sin autorización a las vistas.");
      res.redirect("/login");
      return;
    }

    const { payload } = decodeToken(token);

    req.headers["tipo"] = payload.tipo;

    next();
  } catch (error) {
    console.log("Error al validar las credenciales. Error: ", error);
    res.status(500).send({ status: 500, error: error });
  }
};
