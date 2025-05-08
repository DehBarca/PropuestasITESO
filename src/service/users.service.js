import fs from "node:fs";
import { User } from "../database/entities/users.js";
import { dbConnect, dbDisconnect } from "../database/connections.js";
import { crearToken } from "../utils/jwt.js";

class UserService {
  constructor() {}

  getUsers = async () => {
    try {
      await dbConnect();
      return await User.find();
    } catch (error) {
      console.error(`No se pueden encontrar los usuarios: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  getUserByID = async (id) => {
    try {
      await dbConnect();
      return await User.findById(id);
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  getUserByEmail = async (email) => {
    try {
      await dbConnect();
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      console.error(`Usuario no encontrado: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  addUser = async (user) => {
    try {
      await dbConnect();
      const newUser = new User(user);
      await newUser.save();
      user.id = newUser._id;
      return user;
    } catch (error) {
      console.error(`No se pudo registrar el usuario: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  updateUser = async (id, user) => {
    try {
      await dbConnect();
      await User.findByIdAndUpdate(id, user);
      return true;
    } catch (error) {
      console.error(`No se pudo actualizar el usuario: `, error);
      return false;
    } finally {
      await dbDisconnect();
    }
  };

  deleteUser = async (id) => {
    try {
      await dbConnect();
      return await User.findByIdAndDelete(id);
    } catch (error) {
      console.error(`No se pudo eliminar el usuario: `, error);
    } finally {
      await dbDisconnect();
    }
  };

  ingresar = async ({ email, password }) => {
    try {
      await dbConnect();

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
    } catch (error) {
      console.error("Error al validar credenciales. Error: ", error);
    } finally {
      await dbDisconnect();
    }
  };

  registrar = async (userData) => {
    try {
      await dbConnect();

      const user = new User(userData);

      await user.save();

      return true;
    } catch (error) {
      console.error("Error al crear al usuario. Error: ", error);
    } finally {
      await dbDisconnect();
    }
  };
}

export default UserService;
