import { hash, genSalt, compare } from "bcryptjs";

export const encriptar = async (cadena = "", saltRounds = 10) => {
  try {
    const salt = await genSalt(saltRounds);
    return await hash(cadena, salt);
  } catch (error) {
    console.error("Error al encryptar la contraseña. Error: ", error);
    return;
  }
};

// CORREGIDO: primero texto plano, luego hash
export const comparar = async (cadena = "", hash = "") => {
  try {
    return await compare(cadena, hash);
  } catch (error) {
    console.error("Error al comparar el hash. Error:", error);
    return false;
  }
};
