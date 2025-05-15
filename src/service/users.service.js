import { User } from "../database/entities/users.js";
import { dbConnect, dbDisconnect } from "../database/connections.js";
import { encriptar, comparar } from "../utils/encrypt.js";
import { crearToken } from "../utils/jwt.js";

export class UserService {
  constructor() {}

  getUsers = async () => {
    try {
      return await User.find();
    } catch (error) {
      console.error(`No se pueden encontrar los usuarios: `, error);
    }
  };

  getUserByID = async (id) => {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    }
  };

  getUserByEmail = async (email) => {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    }
  };

  addUser = async (user) => {
    try {
      const newUser = new User(user);
      await newUser.save();
      user.id = newUser._id;
      return user;
    } catch (error) {
      console.error(`No se pudo registrar el usuario: `, error);
    }
  };

  updateUser = async (id, user) => {
    try {
      await User.findByIdAndUpdate(id, user);
      return true;
    } catch (error) {
      console.error(`No se pudo actualizar el usuario: `, error);
      return false;
    }
  };

  deleteUser = async (id) => {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      console.error(`No se pudo eliminar el usuario: `, error);
    }
  };

  ingresar = async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email, deleteAt: null });
      if (!user) {
        return [false, "No se encontró el email"];
      }

      const iguales = await comparar(user.password, password);
      if (!iguales) {
        return [false, "la contraseña no es válida"];
      }

      const token = crearToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return [true, token];
    } catch (error) {
      console.error("Error al validar credenciales. Error: ", error);
    }
  };

  registrar = async (userData) => {
    try {
      // Verify if email already exists
      const existingUser = await User.findOne({
        email: userData.email.toLowerCase(),
      });
      if (existingUser) {
        return { success: false, message: "El email ya está registrado" };
      }

      const user = new User({
        user: userData.user,
        email: userData.email,
        password: userData.password,
        role: userData.role || "user",
      });

      await user.save();

      const token = crearToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return { success: true, token };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return { success: false, message: error.message };
    }
  };

  login = async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return { success: false, message: "Email no encontrado" };
      }

      const validPassword = await comparar(user.password, password);
      if (!validPassword) {
        return { success: false, message: "Contraseña incorrecta" };
      }

      const token = crearToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return { success: true, token };
    } catch (error) {
      console.error("Error al validar credenciales:", error);
      return { success: false, message: error.message };
    }
  };
}
