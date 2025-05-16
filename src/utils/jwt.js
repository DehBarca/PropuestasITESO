import Config from "../config/config.js";
import jwt from "jsonwebtoken";
export const crearToken = (claims) => {
  try {
    const token = jwt.sign(claims, Config.SECRET);
    return token;
  } catch (error) {
    console.error("Error al firmar el jwt. Error: ", error);
    return null;
  }
};

export const validarToken = (token) => {
  try {
    return jwt.verify(token, Config.SECRET);
  } catch (error) {
    console.error("Error al válidar token. Error: ", error);
    return false;
  }
};

export const decodeToken = (token) => {
  try {
    const claims = jwt.decode(token, {
      complete: true,
    });
    return claims;
  } catch (error) {
    console.error("Error al obtener claims del jwt. Error: ", error);
    return null;
  }
};
