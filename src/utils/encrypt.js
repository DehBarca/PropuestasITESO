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

export const comparar = async (hash = "", cadena = "") => {
  try {
    return await compare(cadena, hash);
  } catch (error) {
    console.error("Error al comparar el hash. Error:", error);
    return false;
  }
};
