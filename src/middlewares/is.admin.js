import { request, response } from "express";

export const isAdmin = (req = request, res = response, next) => {
  try {
    const { tipo } = req.headers;

    if (tipo !== "admin") {
      res
        .status(401)
        .send({ status: 401, error: "No tienes los permisos suficientes" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error al validar tipo de usuario. Error: ", error);
    res.status(500).send({ status: 500, error: error });
  }
};
